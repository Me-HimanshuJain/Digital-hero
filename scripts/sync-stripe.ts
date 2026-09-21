import Stripe from "stripe";
import * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2026-08-26.dahlia" as any,
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

async function syncSubscription() {
  try {
    // 1. Get all recent checkout sessions
    const sessions = await stripe.checkout.sessions.list({ limit: 5 });
    
    // Find the most recent successful subscription session
    const session = sessions.data.find(s => s.status === 'complete' && s.mode === 'subscription');
    
    if (!session) {
      console.log("No successful subscription checkout sessions found.");
      return;
    }

    const userId = session.metadata?.userId;
    const subscriptionId = session.subscription as string;
    const customerId = session.customer as string;

    if (!userId) {
      console.log("Session missing userId in metadata.");
      return;
    }

    console.log(`Found session for user ${userId}. Syncing...`);

    // 2. Fetch the subscription from Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
    const priceId = stripeSubscription.items.data[0].price.id;

    // 3. Find the plan in Supabase
    const { data: plan } = await supabase
      .from("subscription_plans")
      .select("id")
      .eq("stripe_price_id", priceId)
      .single();

    if (!plan) {
      console.log(`Plan not found in Supabase for price ID: ${priceId}`);
      return;
    }

    // 4. Insert into Supabase
    const { error } = await supabase
      .from("subscriptions")
      .upsert({
        user_id: userId,
        plan_id: plan.id,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        status: stripeSubscription.status,
        start_at: new Date((stripeSubscription as any).current_period_start * 1000).toISOString(),
        renewal_at: new Date((stripeSubscription as any).current_period_end * 1000).toISOString(),
        canceled_at: (stripeSubscription as any).cancel_at ? new Date((stripeSubscription as any).cancel_at * 1000).toISOString() : null,
      }, { onConflict: 'stripe_subscription_id' });

    if (error) {
      console.error("Error inserting into Supabase:", error);
    } else {
      console.log("Successfully synced subscription to Supabase!");
    }

  } catch (err) {
    console.error("Error syncing:", err);
  }
}

syncSubscription();
