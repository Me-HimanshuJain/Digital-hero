import * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

async function seedPlans() {
  const monthlyPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY;
  const annualPriceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ANNUAL;

  if (!monthlyPriceId || !annualPriceId) {
    console.error("Missing Stripe Price IDs in .env.local");
    return;
  }

  const plans = [
    {
      name: "Monthly Hero",
      price: 4.99,
      billing_interval: "month",
      stripe_price_id: monthlyPriceId,
    },
    {
      name: "Annual Hero",
      price: 49.99,
      billing_interval: "year",
      stripe_price_id: annualPriceId,
    }
  ];

  for (const plan of plans) {
    const { data, error } = await supabase
      .from("subscription_plans")
      .upsert(plan, { onConflict: "stripe_price_id" })
      .select();

    if (error) {
      console.error(`Error inserting plan ${plan.name}:`, error);
    } else {
      console.log(`Inserted plan: ${plan.name}`);
    }
  }
}

seedPlans();
