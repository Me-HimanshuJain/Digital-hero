"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Trophy, Upload, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function WinningsPage() {
  const [winners, setWinners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchWinnings();
  }, []);

  const fetchWinnings = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch winners for this user
    const { data } = await supabase
      .from("winners")
      .select(`
        *,
        draws ( created_at )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (data) setWinners(data);
    setLoading(false);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, winnerId: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not logged in");

      // 1. Upload to storage (winner-proofs bucket / user_id / filename)
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${winnerId}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('winner-proofs')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // 2. Call API to update state machine
      const res = await fetch("/api/winners/proof", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ winnerId, storagePath: fileName })
      });

      if (!res.ok) throw new Error("Failed to submit proof");

      // Refresh list
      await fetchWinnings();
      alert("Proof submitted successfully! The admin team will review it shortly.");
    } catch (error: any) {
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading winnings...</div>;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Winnings</h1>
        <p className="text-muted-foreground mt-2">
          Track your prizes, upload verification documents, and monitor payouts.
        </p>
      </div>

      {winners.length === 0 ? (
        <div className="bg-card border border-white/5 rounded-2xl p-12 text-center">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-white/20" />
          <h3 className="text-xl font-bold mb-2">No winnings yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Keep playing your rounds and logging your scores. Your 5 numbers could be drawn next!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {winners.map((winner) => (
            <div key={winner.id} className="bg-card border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row gap-6">
              <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-primary">£{winner.prize_amount}</h3>
                    <p className="text-muted-foreground">
                      Tier {winner.match_tier} Winner • {new Date(winner.draws.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {/* Status Badge */}
                  <div className="px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-2
                    ${winner.status === 'pending_proof' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                      winner.status === 'proof_submitted' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 
                      winner.status === 'verified' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                      winner.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' : 
                      'bg-purple-500/10 text-purple-500 border-purple-500/20'}">
                    
                    {winner.status === 'pending_proof' && <><AlertTriangle className="w-4 h-4"/> Action Required</>}
                    {winner.status === 'proof_submitted' && <><Clock className="w-4 h-4"/> Under Review</>}
                    {winner.status === 'verified' && <><CheckCircle2 className="w-4 h-4"/> Verified</>}
                    {winner.status === 'rejected' && <><AlertTriangle className="w-4 h-4"/> Proof Rejected</>}
                    {winner.status === 'paid' && <><CheckCircle2 className="w-4 h-4"/> Paid</>}
                  </div>
                </div>

                {/* Proof Upload UI */}
                {(winner.status === 'pending_proof' || winner.status === 'rejected') && (
                  <div className="bg-white/5 rounded-xl p-4 mt-4">
                    <p className="text-sm font-medium mb-2">Upload Verification Proof</p>
                    <p className="text-xs text-muted-foreground mb-4">
                      Please upload a clear photo of your Golf Club Membership or an official Handicap Certificate to verify your identity.
                    </p>
                    <div className="flex items-center gap-4">
                      <Button asChild variant="secondary" disabled={uploading} className="cursor-pointer">
                        <label>
                          {uploading ? "Uploading..." : <><Upload className="w-4 h-4 mr-2" /> Select File</>}
                          <input 
                            type="file" 
                            accept="image/*,.pdf" 
                            className="hidden" 
                            onChange={(e) => handleFileUpload(e, winner.id)}
                            disabled={uploading}
                          />
                        </label>
                      </Button>
                    </div>
                  </div>
                )}
                
                {winner.status === 'proof_submitted' && (
                  <p className="text-sm text-muted-foreground bg-white/5 p-4 rounded-xl">
                    Your proof has been securely uploaded and is being reviewed by our team. We will update this status once verified.
                  </p>
                )}
                
                {winner.status === 'paid' && (
                  <p className="text-sm text-primary bg-primary/10 p-4 rounded-xl font-medium">
                    Funds have been transferred to your account!
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
