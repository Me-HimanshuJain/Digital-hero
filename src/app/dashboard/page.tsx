import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Activity, Heart, ArrowRight } from "lucide-react";
import Link from "next/link";
import { ScoreManager } from "@/components/dashboard/ScoreManager";

export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return null; // Middleware will handle redirect, but this satisfies TS
  }

  // Fetch user's active subscription if any
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status, plan_id, subscription_plans(name)")
    .eq("user_id", user.id)
    .in("status", ["active", "trialing"])
    .maybeSingle();

  const isActive = !!subscription;
  const planName = (subscription?.subscription_plans as any)?.name || "None";

  // Fetch score count this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count: scoreCount } = await supabase
    .from("scores")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("score_date", startOfMonth.toISOString().split("T")[0]);

  const scoresThisMonth = scoreCount || 0;
  const isDrawQualified = scoresThisMonth >= 5;

  const { data: userCharity } = await supabase
    .from("user_charities")
    .select("charities(name)")
    .eq("user_id", user.id)
    .maybeSingle();

  const charityName = (userCharity?.charities as any)?.name || "None Selected";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's how you're doing this month.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Draw Status</CardTitle>
            <Trophy className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isDrawQualified ? "Qualified!" : "Not Entered"}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isDrawQualified ? "You have entered the draw!" : "You need 5 scores this month to qualify."}
            </p>
            <div className="mt-4 flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className={`h-2 flex-1 rounded-full ${i <= scoresThisMonth ? 'bg-primary' : 'bg-muted'}`} />
              ))}
            </div>
            <p className="text-xs text-right mt-2 font-medium text-primary">{Math.min(scoresThisMonth, 5)} / 5 Scores logged</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Active Charity</CardTitle>
            <Heart className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{charityName}</div>
            <p className="text-xs text-muted-foreground mt-1">
              10% of your sub goes here.
            </p>
            <Link href="/dashboard/charities">
              <Button variant="outline" size="sm" className="mt-4 w-full border-white/10">
                Manage Charity
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-white/10 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Subscription</CardTitle>
            <Activity className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{isActive ? "Active" : "Inactive"}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isActive ? `Plan: ${planName}` : "Subscribe to unlock score tracking."}
            </p>
            {!isActive && (
              <Link href="/pricing">
                <Button size="sm" className="mt-4 w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Upgrade Plan
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-card/50 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Log & Manage Scores</CardTitle>
            <CardDescription>
              Submit your Stableford scores here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScoreManager isActive={isActive} />
          </CardContent>
        </Card>
        
        <Card className="col-span-3 bg-card/50 border-white/10 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Next Draw</CardTitle>
            <CardDescription>
              April 2026 Edition
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <span className="text-muted-foreground">Date</span>
                <span className="font-medium">Apr 30, 2026</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <span className="text-muted-foreground">Est. Prize Pool</span>
                <span className="font-medium text-primary">£5,000+</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <span className="text-muted-foreground">Your Status</span>
                <span className={`font-medium ${isDrawQualified ? 'text-primary' : 'text-destructive'}`}>
                  {isDrawQualified ? 'Qualified' : 'Not Qualified'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
