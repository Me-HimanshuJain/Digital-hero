"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Heart, Users } from "lucide-react";

export default function AdminCharitiesPage() {
  const [charityStats, setCharityStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    // Fetch all charities
    const { data: charities } = await supabase
      .from("charities")
      .select("*")
      .order("name");

    // Fetch all user_charities to count supporters
    const { data: userCharities } = await supabase
      .from("user_charities")
      .select("charity_id");

    if (charities && userCharities) {
      // Map and count
      const stats = charities.map(charity => {
        const supporters = userCharities.filter(uc => uc.charity_id === charity.id).length;
        return {
          ...charity,
          supporters
        };
      }).sort((a, b) => b.supporters - a.supporters); // Sort by most supported

      setCharityStats(stats);
    }
    setLoading(false);
  };

  if (loading) return <div className="animate-pulse">Loading charity statistics...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Charity Management</h1>
      <p className="text-muted-foreground max-w-2xl">
        View platform-wide charity statistics and manage the available charities for your members.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        {charityStats.map(charity => (
          <div key={charity.id} className="bg-card border border-white/10 rounded-2xl p-6 flex flex-col relative overflow-hidden">
            <div className={`absolute top-0 left-0 w-full h-1 ${charity.is_active ? 'bg-primary' : 'bg-muted/30'}`} />
            
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">{charity.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {charity.description}
              </p>
              
              <div className="flex items-center gap-2 text-primary bg-primary/10 w-fit px-3 py-1.5 rounded-lg font-medium">
                <Users className="w-4 h-4" /> 
                {charity.supporters} Supporter{charity.supporters !== 1 && 's'}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center text-sm">
              <span className={charity.is_active ? "text-green-500" : "text-muted-foreground"}>
                {charity.is_active ? "Active" : "Inactive"}
              </span>
              <a href={charity.website_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-white transition-colors">
                Visit Website &rarr;
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
