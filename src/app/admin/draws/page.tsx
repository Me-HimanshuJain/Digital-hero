"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Play, CheckCircle2, AlertTriangle } from "lucide-react";
import { DrawSimulationResult } from "@/server/domain/draw/DrawOrchestrator";
import { createClient } from "@/lib/supabase/client";

export default function AdminDrawsPage() {
  const [simulation, setSimulation] = useState<DrawSimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [useMockData, setUseMockData] = useState(false);
  const [currency, setCurrency] = useState<"GBP" | "INR" | "USD">("GBP");
  const supabase = createClient();

  useEffect(() => {
    async function fetchRegion() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: profile } = await supabase.from('profiles').select('region').eq('id', session.user.id).single();
        if (profile?.region === 'India') setCurrency('INR');
        else if (profile?.region === 'USA') setCurrency('USD');
        else setCurrency('GBP');
      }
    }
    fetchRegion();
  }, [supabase]);

  const formatCurrency = (amount: number) => {
    switch (currency) {
      case "INR":
        return `₹${(amount * 106).toFixed(2)}`;
      case "USD":
        return `$${(amount * 1.25).toFixed(2)}`;
      default:
        return `£${amount.toFixed(2)}`;
    }
  };

  const handleSimulate = async () => {
    setLoading(true);
    setError("");
    setSimulation(null);
    setSuccessMessage("");
    
    try {
      const res = await fetch("/api/admin/draw/simulate", { 
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ useMockData })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Simulation failed");
      
      setSimulation(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!confirm("Are you absolutely sure? This will lock in these results and generate winners in the database. This action CANNOT be undone.")) {
      return;
    }

    setPublishing(true);
    setError("");
    
    try {
      const res = await fetch("/api/admin/draw/publish", { method: "POST" });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Publish failed");
      
      setSuccessMessage("Draw published successfully! Winners have been generated.");
      setSimulation(null); // Clear simulation after publish
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Draw Management</h1>
          <p className="text-muted-foreground max-w-2xl mt-2">
            Run a simulation to preview the prize pool calculations and winning numbers for this month's draw. 
            Simulations do not affect the database. Once you verify the math, click Publish to lock it in.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-destructive/20 text-destructive border border-destructive rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" /> {error}
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-primary/20 text-primary border border-primary rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" /> {successMessage}
        </div>
      )}

      <div className="pt-4 flex items-center gap-6">
        <Button onClick={handleSimulate} disabled={loading || publishing} size="lg" className="gap-2">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
          {loading ? "Running Algorithms..." : "Preview Next Draw"}
        </Button>
        
        <div className="flex items-center space-x-2">
          <input 
            type="checkbox" 
            id="mockData" 
            checked={useMockData} 
            onChange={(e) => setUseMockData(e.target.checked)}
            className="w-4 h-4 accent-primary"
          />
          <label htmlFor="mockData" className="text-sm font-medium text-muted-foreground cursor-pointer select-none">
            Simulate with 10,000 dummy users
          </label>
        </div>
      </div>

      {simulation && (
        <div className="mt-8 space-y-8 animate-in fade-in slide-in-from-bottom-4">
          
          {/* Simulation Results Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Draw Results */}
            <div className="bg-card border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4 text-primary">Generated Draw</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Eligible Participants</p>
                  <p className="text-2xl font-bold">{simulation.eligibleUsersCount}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Winning Numbers (Cryptographic Random)</p>
                  <div className="flex gap-2">
                    {simulation.winningNumbers.map((n, i) => (
                      <div key={i} className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                        {n}
                      </div>
                    ))}
                    {simulation.winningNumbers.length === 0 && <span className="text-muted-foreground text-sm italic">None generated (0 participants)</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Prize Pool Split */}
            <div className="bg-card border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-4 text-primary">Prize Pool Distribution</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <span className="text-muted-foreground">Base Pool + Rollover</span>
                  <span className="font-bold">{formatCurrency(simulation.poolDistribution.total_pool)}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <span className="text-muted-foreground">Tier 3 (25%)</span>
                  <span className="font-medium">{formatCurrency(simulation.poolDistribution.tier_3_match_pool)}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <span className="text-muted-foreground">Tier 4 (35%)</span>
                  <span className="font-medium">{formatCurrency(simulation.poolDistribution.tier_4_match_pool)}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <span className="text-muted-foreground">Tier 5 (40% + Rollover)</span>
                  <span className="font-medium text-primary">{formatCurrency(simulation.poolDistribution.tier_5_match_pool)}</span>
                </div>
              </div>
            </div>

            {/* Winners & Payouts */}
            <div className="bg-card border border-white/10 rounded-2xl p-6 md:col-span-2">
              <h3 className="text-xl font-bold mb-4 text-primary">Simulated Winners & Payouts</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-black/20 rounded-xl">
                  <p className="text-sm text-muted-foreground">Tier 3 Matches</p>
                  <p className="text-xl font-bold mt-1">{simulation.winners.tier3} Winners</p>
                  <p className="text-sm text-primary mt-1">{formatCurrency(simulation.prizes.tier3PerWinner)} each</p>
                </div>
                <div className="p-4 bg-black/20 rounded-xl">
                  <p className="text-sm text-muted-foreground">Tier 4 Matches</p>
                  <p className="text-xl font-bold mt-1">{simulation.winners.tier4} Winners</p>
                  <p className="text-sm text-primary mt-1">{formatCurrency(simulation.prizes.tier4PerWinner)} each</p>
                </div>
                <div className="p-4 bg-black/20 rounded-xl">
                  <p className="text-sm text-muted-foreground">Tier 5 Matches</p>
                  <p className="text-xl font-bold mt-1">{simulation.winners.tier5} Winners</p>
                  <p className="text-sm text-primary mt-1">{formatCurrency(simulation.prizes.tier5PerWinner)} each</p>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
                <span className="text-muted-foreground font-medium">Estimated Rollover to Next Month:</span>
                <span className="text-xl font-bold">{formatCurrency(simulation.nextRollover)}</span>
              </div>
            </div>

          </div>

          {/* Publish Action */}
          <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-destructive">Ready to finalize?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Publishing the draw will save these numbers to the database and generate official winners. This is permanent.
              </p>
            </div>
            <Button 
              onClick={handlePublish} 
              disabled={publishing || simulation.eligibleUsersCount === 0} 
              variant="destructive"
              size="lg"
            >
              {publishing ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
              Publish Draw Results
            </Button>
          </div>

        </div>
      )}

    </div>
  );
}
