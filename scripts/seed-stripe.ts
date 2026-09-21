import Stripe from "stripe";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2026-08-26.dahlia" as any,
});

async function main() {
  try {
    // Create Monthly Product and Price
    const monthlyProduct = await stripe.products.create({
      name: "Digital Heroes - Monthly Hero",
      description: "Monthly subscription with entry into the draw and 10% charity contribution.",
    });

    const monthlyPrice = await stripe.prices.create({
      product: monthlyProduct.id,
      unit_amount: 499, // £4.99
      currency: "gbp",
      recurring: { interval: "month" },
    });

    console.log(`NEXT_PUBLIC_STRIPE_PRICE_MONTHLY=${monthlyPrice.id}`);

    // Create Annual Product and Price
    const annualProduct = await stripe.products.create({
      name: "Digital Heroes - Annual Hero",
      description: "Annual subscription with entry into the draw and 10% charity contribution.",
    });

    const annualPrice = await stripe.prices.create({
      product: annualProduct.id,
      unit_amount: 4999, // £49.99
      currency: "gbp",
      recurring: { interval: "year" },
    });

    console.log(`NEXT_PUBLIC_STRIPE_PRICE_ANNUAL=${annualPrice.id}`);

  } catch (error) {
    console.error("Error creating Stripe prices:", error);
  }
}

main();
