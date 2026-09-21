import * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

async function seedPlans() {
  const plans = [
    {
      name: "Monthly Hero",
      billing_interval: "month",
      price: 4.99,
      currency: "GBP",
      stripe_price_id: "price_1UHpeQHyyxarLgzJ7DnheLQA" // From your .env
    },
    {
      name: "Annual Hero",
      billing_interval: "year",
      price: 49.99,
      currency: "GBP",
      stripe_price_id: "price_1UHpeRHyyxarLgzJkP35Kh1d" // From your .env
    }
  ];

  for (const plan of plans) {
    const { error } = await supabase
      .from("subscription_plans")
      .upsert(plan, { onConflict: "stripe_price_id" });
      
    if (error) {
      console.error("Error inserting plan:", error);
    } else {
      console.log(`Successfully seeded plan: ${plan.name}`);
    }
  }
}

seedPlans();
