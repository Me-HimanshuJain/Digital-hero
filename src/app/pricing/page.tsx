"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/marketing/Navbar";
import { Footer } from "@/components/marketing/Footer";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function PricingPage() {
  const [currency, setCurrency] = useState<"GBP" | "INR" | "USD">("GBP");
  const [isGuest, setIsGuest] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function fetchRegionAndSub() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsGuest(false);
        const { data: profile } = await supabase.from('profiles').select('region').eq('id', session.user.id).single();
        if (profile?.region === 'India') setCurrency('INR');
        else if (profile?.region === 'USA') setCurrency('USD');
        else setCurrency('GBP');

        const { data: sub } = await supabase
          .from("subscriptions")
          .select("status, plan_id, subscription_plans(name)")
          .eq("user_id", session.user.id)
          .in("status", ["active", "trialing"])
          .maybeSingle();
          
        if (sub) {
          setIsActive(true);
          setCurrentPlan((sub.subscription_plans as any)?.name);
        }
      }
    }
    fetchRegionAndSub();
  }, [supabase]);

  const pricing = {
    GBP: { monthly: "£4.99", annual: "£49.99", save: "£10" },
    INR: { monthly: "₹100", annual: "₹1000", save: "₹200" },
    USD: { monthly: "$5.99", annual: "$59.99", save: "$12" }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden">
      <Navbar />
      
      <main className="flex-1 pb-24">
        <section className="py-24 text-center px-4 relative">
          <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top,rgba(0,196,106,0.1)_0%,transparent_50%)]"></div>
          <div className="container relative z-10 mx-auto max-w-3xl space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold font-heading">
              Invest in your game.<br/>
              <span className="text-primary">Impact the world.</span>
            </h1>
            <p className="text-lg text-muted-foreground text-balance">
              Join Digital Heroes today. A minimum of 10% of your subscription goes directly to the charity of your choice, and your golf scores could win you cash prizes every month.
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 max-w-5xl">
          {isGuest && (
            <div className="flex flex-col items-center mb-8 relative z-20">
              <div className="inline-flex items-center p-1 bg-white/5 border border-white/10 rounded-xl shadow-sm mb-2">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as "GBP" | "INR" | "USD")}
                  className="bg-transparent border-none text-sm font-medium px-4 py-2 focus:ring-0 cursor-pointer outline-none"
                >
                  <option value="GBP" className="bg-background">United Kingdom (GBP £)</option>
                  <option value="INR" className="bg-background">India (INR ₹)</option>
                  <option value="USD" className="bg-background">United States (USD $)</option>
                </select>
              </div>
              <p className="text-xs text-muted-foreground italic">
                * Note: Pricing varies according to your selected region.
              </p>
            </div>
          )}

          <div className="grid md:grid-cols-2 gap-8 items-start">
            
            {/* Monthly Plan */}
            <div className="rounded-3xl border border-white/10 bg-card/30 backdrop-blur-sm p-8 shadow-xl">
              <h3 className="text-2xl font-bold">Monthly Hero</h3>
              <div className="mt-4 flex items-baseline text-5xl font-extrabold">
                {pricing[currency].monthly}
                <span className="ml-1 text-xl font-medium text-muted-foreground">/mo</span>
              </div>
              <p className="mt-4 text-muted-foreground">
                Flexible monthly billing. Cancel anytime.
              </p>
              
              <ul className="mt-8 space-y-4">
                {[
                  "Entry into the Monthly Draw (with 5 scores)",
                  "Select a charity for your 10% contribution",
                  "Access to personal scoring dashboard",
                  "Automated handicap indexing tracking",
                  "Verified cryptographic draw system",
                ].map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <Check className="h-5 w-5 text-primary shrink-0 mr-3" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-8">
                {isActive ? (
                  <form action="/api/stripe/portal" method="POST">
                    <Button type="submit" className="w-full h-12 text-lg font-medium border-white/20" variant="outline">
                      Manage Subscription
                    </Button>
                  </form>
                ) : (
                  <form action="/api/stripe/checkout" method="POST">
                    <input type="hidden" name="priceId" value="price_1UHpeQHyyxarLgzJ7DnheLQA" />
                    <Button type="submit" className="w-full h-12 text-lg font-medium border-white/20" variant="outline">
                      Subscribe Monthly
                    </Button>
                  </form>
                )}
              </div>
            </div>

            {/* Annual Plan */}
            <div className="rounded-3xl border border-primary/50 bg-primary/5 backdrop-blur-sm p-8 shadow-xl relative">
              <div className="absolute top-0 right-8 transform -translate-y-1/2">
                <span className="bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full">
                  Recommended
                </span>
              </div>
              <h3 className="text-2xl font-bold text-primary">Annual Hero</h3>
              <div className="mt-4 flex items-baseline text-5xl font-extrabold">
                {pricing[currency].annual}
                <span className="ml-1 text-xl font-medium text-muted-foreground">/yr</span>
              </div>
              <p className="mt-4 text-muted-foreground">
                Save ~16% with annual billing. 
              </p>
              
              <ul className="mt-8 space-y-4">
                {[
                  "Everything in the Monthly plan",
                  `Save ${pricing[currency].save} over the year`,
                  "Larger upfront impact for your charity",
                  "Exclusive year-end impact report",
                ].map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <Check className="h-5 w-5 text-primary shrink-0 mr-3" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-8">
                {isActive ? (
                  <form action="/api/stripe/portal" method="POST">
                    <Button type="submit" className="w-full h-12 text-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90">
                      Manage Subscription
                    </Button>
                  </form>
                ) : (
                  <form action="/api/stripe/checkout" method="POST">
                    <input type="hidden" name="priceId" value="price_1UHpeRHyyxarLgzJkP35Kh1d" />
                    <Button type="submit" className="w-full h-12 text-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90">
                      Subscribe Annually
                    </Button>
                  </form>
                )}
              </div>
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
