import { createClient } from "@/lib/supabase/server";

export class WinnerVerificationService {
  /**
   * Called by the Winner when they submit their proof document.
   * @param winnerId The ID from the `winners` table
   * @param storagePath The path to the uploaded file in the `winner-proofs` bucket
   */
  static async submitProof(winnerId: string, storagePath: string) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // 1. Verify this winner record belongs to this user
    const { data: winner, error: winnerError } = await supabase
      .from("winners")
      .select("*")
      .eq("id", winnerId)
      .eq("user_id", user.id)
      .single();

    if (winnerError || !winner) throw new Error("Winner record not found");
    if (winner.verification_status !== 'pending_proof' && winner.verification_status !== 'rejected') {
      throw new Error("Cannot submit proof for this winner status");
    }

    // 2. Insert into winner_proofs
    const { data: proof, error: proofError } = await supabase
      .from("winner_proofs")
      .insert({
        winner_id: winnerId,
        file_url: storagePath,
        file_type: "document"
      })
      .select()
      .single();

    if (proofError) throw proofError;

    // 3. Update winner status
    const { error: updateError } = await supabase
      .from("winners")
      .update({ verification_status: "under_review" })
      .eq("id", winnerId);

    if (updateError) throw updateError;

    return proof;
  }

  /**
   * Called by Admin to verify/approve a submitted proof
   */
  static async verifyProof(proofId: string, adminNotes?: string) {
    const supabase = createClient();
    
    // Ensure admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") throw new Error("Forbidden");

    // Get the proof to find the winner_id
    const { data: proof, error: fetchError } = await supabase
      .from("winner_proofs")
      .select("winner_id")
      .eq("id", proofId)
      .single();

    if (fetchError || !proof) throw new Error("Proof not found");

    // Update proof status
    await supabase
      .from("winner_proofs")
      .update({ reviewed_at: new Date().toISOString(), reviewed_by: user.id })
      .eq("id", proofId);

    // Update winner status to verified
    await supabase
      .from("winners")
      .update({ verification_status: "verified" })
      .eq("id", proof.winner_id);

    return { success: true };
  }

  /**
   * Called by Admin to reject a submitted proof
   */
  static async rejectProof(proofId: string, rejectionReason: string) {
    const supabase = createClient();
    
    // Ensure admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") throw new Error("Forbidden");

    const { data: proof, error: fetchError } = await supabase
      .from("winner_proofs")
      .select("winner_id")
      .eq("id", proofId)
      .single();

    if (fetchError || !proof) throw new Error("Proof not found");

    // Update proof status
    await supabase
      .from("winner_proofs")
      .update({ rejection_reason: rejectionReason, reviewed_at: new Date().toISOString(), reviewed_by: user.id })
      .eq("id", proofId);

    // Update winner status back to rejected (so they can upload again)
    await supabase
      .from("winners")
      .update({ verification_status: "rejected" })
      .eq("id", proof.winner_id);

    return { success: true };
  }

  /**
   * Called by Admin when the money has been sent to the winner's bank account
   */
  static async markAsPaid(winnerId: string, transactionReference: string, amount: number) {
    const supabase = createClient();
    
    // Ensure admin
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") throw new Error("Forbidden");

    const { data: winner, error: fetchError } = await supabase
      .from("winners")
      .select("*")
      .eq("id", winnerId)
      .single();

    if (fetchError || !winner) throw new Error("Winner not found");
    if (winner.verification_status !== 'verified') throw new Error("Winner is not verified yet");

    // Create payout record
    const { error: payoutError } = await supabase
      .from("payouts")
      .insert({
        winner_id: winnerId,
        amount: amount,
        status: "completed",
        transaction_reference: transactionReference,
        processed_at: new Date().toISOString()
      });

    if (payoutError) throw payoutError;

    // Update winner status
    const { error: updateError } = await supabase
      .from("winners")
      .update({ payout_status: "paid" })
      .eq("id", winnerId);

    if (updateError) throw updateError;

    return { success: true };
  }
}
