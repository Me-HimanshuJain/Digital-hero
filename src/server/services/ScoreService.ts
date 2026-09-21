import { createClient } from "@/lib/supabase/server";

export interface ScoreData {
  id: string;
  user_id: string;
  score: number;
  score_date: string;
  created_at: string;
}

export class ScoreService {
  /**
   * Retrieves the user's latest scores (up to 5) ordered by date descending
   */
  static async getLatestScores(): Promise<ScoreData[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { data, error } = await supabase
      .from("scores")
      .select("*")
      .eq("user_id", user.id)
      .order("score_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) throw new Error(error.message);
    return data || [];
  }

  /**
   * Adds a new score and enforces the rolling-5 limit
   */
  static async addScore(score: number, score_date: string): Promise<ScoreData[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    if (score < 1 || score > 45) {
      throw new Error("Score must be between 1 and 45");
    }

    // Insert the new score
    const { error: insertError } = await supabase
      .from("scores")
      .insert({
        user_id: user.id,
        score,
        score_date,
      });

    if (insertError) {
      if (insertError.code === '23505') { // unique_violation
        throw new Error("A score for this date already exists.");
      }
      throw new Error(insertError.message);
    }

    // Enforce rolling-5 limit:
    // Get all scores ordered by date DESC
    const { data: allScores, error: fetchError } = await supabase
      .from("scores")
      .select("id")
      .eq("user_id", user.id)
      .order("score_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (fetchError) throw new Error(fetchError.message);

    if (allScores && allScores.length > 5) {
      // Find the IDs of the oldest scores to delete
      const scoresToDelete = allScores.slice(5).map(s => s.id);
      
      const { error: deleteError } = await supabase
        .from("scores")
        .delete()
        .in("id", scoresToDelete);

      if (deleteError) {
        console.error("Error enforcing rolling 5 limit:", deleteError);
        // We don't throw here to avoid failing the whole request since the new score was saved
      }
    }

    return this.getLatestScores();
  }

  /**
   * Deletes a specific score
   */
  static async deleteScore(scoreId: string): Promise<ScoreData[]> {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase
      .from("scores")
      .delete()
      .eq("id", scoreId)
      .eq("user_id", user.id);

    if (error) throw new Error(error.message);

    return this.getLatestScores();
  }
}
