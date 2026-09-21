"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Check, X, CreditCard, ExternalLink, Loader2 } from "lucide-react";

export default function AdminWinnersPage() {
  const [proofs, setProofs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchProofs();
  }, []);

  const fetchProofs = async () => {
    // Fetch proofs joined with winner details
    const { data, error } = await supabase
      .from("winner_proofs")
      .select(`
        *,
        winners (
          *,
          profiles ( id, full_name )
        )
      `)
      .order("submitted_at", { ascending: false });

    if (data) setProofs(data);
    setLoading(false);
  };

  const handleVerify = async (proofId: string, action: 'approve' | 'reject') => {
    setProcessingId(proofId);
    try {
      let notes = "";
      if (action === 'reject') {
        const reason = prompt("Enter rejection reason (will be visible to user):");
        if (!reason) {
          setProcessingId(null);
          return;
        }
        notes = reason;
      }

      const res = await fetch("/api/admin/winners/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ proofId, action, adminNotes: notes })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to process");
      }

      await fetchProofs();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handlePay = async (winnerId: string, amount: number) => {
    setProcessingId(winnerId);
    try {
      const ref = prompt("Enter the Bank Transaction Reference ID to confirm payout:");
      if (!ref) {
        setProcessingId(null);
        return;
      }

      const res = await fetch("/api/admin/winners/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ winnerId, transactionReference: ref, amount })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to mark as paid");
      }

      await fetchProofs();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const getSignedUrl = async (path: string) => {
    const { data } = await supabase.storage.from("winner-proofs").createSignedUrl(path, 60);
    if (data?.signedUrl) {
      window.open(data.signedUrl, "_blank");
    } else {
      alert("Could not load document.");
    }
  };

  if (loading) return <div className="animate-pulse">Loading proofs...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Winner Verification & Payouts</h1>
      <p className="text-muted-foreground max-w-2xl">
        Review uploaded proofs (IDs/Golf Memberships) submitted by winners. Approve them to authorize payouts, or reject them if the proof is invalid.
      </p>

      {proofs.length === 0 ? (
        <div className="p-12 border border-white/10 rounded-2xl text-center bg-card">
          <p className="text-muted-foreground">No proofs have been submitted yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {proofs.map(proof => (
            <div key={proof.id} className="bg-card border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row gap-6 justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-lg">{proof.winners.profiles.full_name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-muted-foreground font-mono">
                    ID: {proof.winners.profiles.id.slice(0, 8)}...
                  </span>
                </div>
                <p className="text-primary font-bold text-xl mb-1">
                  Won £{proof.winners.prize_amount} <span className="text-sm text-muted-foreground font-normal">(Tier {proof.winners.match_tier})</span>
                </p>
                
                <div className="mt-4 flex gap-3">
                  <Button variant="outline" size="sm" onClick={() => getSignedUrl(proof.file_url)}>
                    <ExternalLink className="w-4 h-4 mr-2" /> View Uploaded Proof
                  </Button>
                </div>
              </div>

              <div className="flex flex-col gap-2 min-w-[200px] border-l border-white/5 pl-6">
                <p className="text-sm text-muted-foreground mb-1">Status: <span className="font-bold text-white capitalize">{proof.winners.verification_status.replace("_", " ")}</span></p>
                
                {proof.winners.verification_status === 'under_review' && (
                  <>
                    <Button 
                      onClick={() => handleVerify(proof.id, 'approve')} 
                      disabled={processingId === proof.id}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {processingId === proof.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
                      Approve Proof
                    </Button>
                    <Button 
                      onClick={() => handleVerify(proof.id, 'reject')} 
                      disabled={processingId === proof.id}
                      variant="destructive"
                    >
                      {processingId === proof.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <X className="w-4 h-4 mr-2" />}
                      Reject
                    </Button>
                  </>
                )}

                {proof.winners.verification_status === 'verified' && proof.winners.payout_status !== 'paid' && (
                  <div className="mt-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <p className="text-xs text-blue-400 mb-2">Proof approved. Waiting for bank transfer.</p>
                    <Button 
                      onClick={() => handlePay(proof.winners.id, proof.winners.prize_amount)} 
                      disabled={processingId === proof.winners.id}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      {processingId === proof.winners.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4 mr-2" />}
                      Mark as Paid
                    </Button>
                  </div>
                )}

                {proof.winners.payout_status === 'paid' && (
                  <div className="flex items-center gap-2 text-green-500 font-bold mt-2">
                    <Check className="w-5 h-5" /> Payout Complete
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
