"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Trash2 } from "lucide-react";
import { ScoreData } from "@/server/services/ScoreService";

export function ScoreManager({ isActive = true }: { isActive?: boolean }) {
  const router = useRouter();
  const [scores, setScores] = useState<ScoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  // Form state
  const [scoreValue, setScoreValue] = useState("");
  const [scoreDate, setScoreDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const fetchScores = async () => {
    try {
      const res = await fetch("/api/scores");
      if (!res.ok) throw new Error("Failed to fetch scores");
      const data = await res.json();
      setScores(data);
    } catch (err: any) {
      console.error(err);
      setError("Could not load scores.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScores();
  }, []);

  const handleAddScore = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const parsedScore = parseInt(scoreValue, 10);
    if (isNaN(parsedScore) || parsedScore < 1 || parsedScore > 45) {
      setError("Score must be between 1 and 45.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score: parsedScore, score_date: scoreDate }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to add score");
      }

      setScores(data); // Returns the updated list of up to 5 scores
      setScoreValue(""); // Reset input
      router.refresh(); // Refresh the page server components to update the qualified status
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteScore = async (id: string) => {
    try {
      const res = await fetch(`/api/scores/${id}`, {
        method: "DELETE",
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");
      
      setScores(data);
      router.refresh(); // Refresh the page server components
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      {error && <div className="p-4 bg-destructive/20 text-destructive border border-destructive rounded-xl">{error}</div>}
      
      {!isActive ? (
        <div className="bg-card p-8 rounded-2xl border border-white/5 text-center space-y-4">
          <h3 className="text-xl font-bold">Subscription Required</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            You need an active subscription to log scores and enter the monthly draw.
          </p>
        </div>
      ) : (
        <form onSubmit={handleAddScore} className="flex flex-col sm:flex-row gap-4 items-end bg-card p-6 rounded-2xl border border-white/5">
          <div className="space-y-2 w-full sm:w-1/3">
            <label className="text-sm font-medium">Stableford Score (1-45)</label>
            <Input 
              type="number" 
              min="1" 
              max="45" 
              value={scoreValue}
              onChange={(e) => setScoreValue(e.target.value)}
              required
              className="bg-background"
            />
          </div>
          <div className="space-y-2 w-full sm:w-1/3">
            <label className="text-sm font-medium">Date Played</label>
            <Input 
              type="date" 
              value={scoreDate}
              max={new Date().toISOString().split('T')[0]} // no future dates
              onChange={(e) => setScoreDate(e.target.value)}
              required
              className="bg-background"
            />
          </div>
          <Button disabled={submitting} type="submit" className="w-full sm:w-auto h-10">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Submit Score
          </Button>
        </form>
      )}

      <div className="bg-card rounded-2xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 bg-white/5">
          <h3 className="font-semibold">Your Draw Numbers (Latest 5 Scores)</h3>
          <p className="text-sm text-muted-foreground mt-1">
            We automatically use your latest 5 scores as your entry numbers for the monthly draw.
          </p>
        </div>
        
        {scores.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No scores submitted yet. Add a score to get started!
          </div>
        ) : (
          <ul className="divide-y divide-white/5">
            {scores.map((s, index) => (
              <li key={s.id} className="p-4 sm:px-6 flex items-center justify-between hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                    {s.score}
                  </div>
                  <div>
                    <p className="font-medium">Number {index + 1}</p>
                    <p className="text-sm text-muted-foreground">
                      Played on {new Date(s.score_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  onClick={() => handleDeleteScore(s.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
