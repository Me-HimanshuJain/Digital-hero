"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Heart, CheckCircle2 } from "lucide-react";
import { Charity, UserCharity } from "@/server/services/CharityService";

export function CharityManager({ isActive = true }: { isActive?: boolean }) {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [userCharity, setUserCharity] = useState<UserCharity | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      const [charitiesRes, userCharityRes] = await Promise.all([
        fetch("/api/charities"),
        fetch("/api/user/charity")
      ]);

      if (!charitiesRes.ok) throw new Error("Failed to fetch charities");
      if (!userCharityRes.ok) throw new Error("Failed to fetch user charity");

      const charitiesData = await charitiesRes.json();
      const userCharityData = await userCharityRes.json();

      setCharities(charitiesData);
      setUserCharity(userCharityData.userCharity);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSelectCharity = async (charityId: string) => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/user/charity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ charityId, percentage: 10 }), // Fixed at 10% for MVP
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setUserCharity(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-8"><Loader2 className="animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      {error && <div className="p-4 bg-destructive/20 text-destructive border border-destructive rounded-xl">{error}</div>}
      
      {userCharity && userCharity.charities ? (
        <div className="bg-primary/10 border border-primary/20 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <Heart className="w-8 h-8 text-primary" />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-xl font-bold">You are supporting {userCharity.charities.name}</h3>
            <p className="text-muted-foreground mt-2">
              {userCharity.contribution_percentage}% of your subscription goes directly to this charity every month.
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-2 text-primary font-medium">
            <CheckCircle2 className="w-5 h-5" /> Active
          </div>
        </div>
      ) : (
        <div className="bg-card p-6 rounded-2xl border border-white/5 text-center">
          <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Select a Charity</h3>
          <p className="text-muted-foreground mb-4">
            Pick a charity below to direct 10% of your subscription to them!
          </p>
        </div>
      )}

      <div className="flex items-center justify-between mt-8 mb-4">
        <h4 className="text-lg font-semibold">Available Charities</h4>
        {!isActive && (
          <span className="text-sm text-destructive bg-destructive/10 px-3 py-1 rounded-full font-medium">
            Active subscription required to support
          </span>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {charities.length === 0 ? (
          <p className="text-muted-foreground col-span-full">No charities available at the moment.</p>
        ) : (
          charities.map((charity) => {
            const isSelected = userCharity?.charity_id === charity.id;
            return (
              <div 
                key={charity.id} 
                className={`bg-card border rounded-2xl p-6 flex flex-col transition-all ${isSelected ? 'border-primary shadow-[0_0_15px_rgba(0,196,106,0.2)]' : 'border-white/10 hover:border-white/30'}`}
              >
                <h5 className="font-bold text-lg">{charity.name}</h5>
                <p className="text-sm text-muted-foreground mt-2 flex-1">{charity.description}</p>
                <Button 
                  onClick={() => handleSelectCharity(charity.id)}
                  disabled={isSelected || saving || !isActive}
                  variant={isSelected ? "secondary" : "default"}
                  className="mt-6 w-full"
                >
                  {isSelected ? "Currently Supporting" : "Support"}
                </Button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
