import { CharityManager } from "@/components/dashboard/CharityManager";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function CharitiesPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("status")
    .eq("user_id", user?.id)
    .in("status", ["active", "trialing"])
    .maybeSingle();

  const isActive = !!subscription;

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Impact</h1>
        <p className="text-muted-foreground mt-2">
          Choose which charity receives 25% of your subscription fee. You can change this at any time!
        </p>
      </div>

      <div className="bg-card border border-white/10 rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <Heart className="w-5 h-5 text-primary" /> Active Charities
        </h2>
        
        <CharityManager isActive={isActive} />
      </div>
    </div>
  );
}
