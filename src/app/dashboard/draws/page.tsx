import { createClient } from "@/lib/supabase/server";
import { Trophy, Calendar } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function UserDrawsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch past draws
  const { data: draws } = await supabase
    .from("draws")
    .select("*")
    .order("created_at", { ascending: false });

  // Fetch user's active scores to see their current numbers
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { data: activeScores } = await supabase
    .from("scores")
    .select("score")
    .eq("user_id", user?.id)
    .gte("score_date", startOfMonth.toISOString().split("T")[0]);

  const activeNumbers = activeScores?.map(s => s.score).sort((a, b) => a - b) || [];
  const isQualified = activeNumbers.length === 5;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Monthly Draws</h1>
        <p className="text-muted-foreground mt-2">
          View your upcoming entries and past draw results.
        </p>
      </div>

      <div className="bg-card border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" /> Next Draw Entry
        </h2>
        
        {isQualified ? (
          <div className="bg-primary/10 border border-primary/20 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="font-bold text-primary mb-2">You are officially entered!</p>
              <p className="text-sm text-muted-foreground">Your 5 Stableford scores will be used as your draw numbers.</p>
            </div>
            <div className="flex gap-2">
              {activeNumbers.map((n, i) => (
                <div key={i} className="w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-[0_0_15px_rgba(0,196,106,0.5)] flex items-center justify-center font-bold text-lg">
                  {n}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="font-bold mb-2">Not Qualified Yet</p>
              <p className="text-sm text-muted-foreground">You need 5 Stableford scores this month to enter the draw. You currently have {activeNumbers.length}.</p>
            </div>
            <Link href="/dashboard">
              <Button>Log More Scores</Button>
            </Link>
          </div>
        )}
      </div>

      <h3 className="text-xl font-bold pt-4">Past Results</h3>
      
      {!draws || draws.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border border-white/5 rounded-2xl">
          <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No draws have taken place yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {draws.map(draw => (
            <div key={draw.id} className="bg-card border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <p className="font-bold">{new Date(draw.created_at).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })} Draw</p>
                <p className="text-sm text-muted-foreground mt-1">Total Prize Pool: £{draw.total_prize_pool}</p>
              </div>
              <div className="flex gap-2">
                {draw.winning_numbers.map((n: number, i: number) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center font-bold">
                    {n}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
