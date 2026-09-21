import Stripe from "stripe";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2026-08-26.dahlia" as any,
});

async function run() {
  const sessions = await stripe.checkout.sessions.list({ limit: 5 });
  const session = sessions.data.find(s => s.status === 'complete' && s.mode === 'subscription');
  if (session && session.subscription) {
    const sub = await stripe.subscriptions.retrieve(session.subscription as string);
    console.log(JSON.stringify(sub, null, 2));
  }
}
run();
