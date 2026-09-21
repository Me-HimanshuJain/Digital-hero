import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe/config";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let priceId = "";
    
    // Check if the request is JSON or form data
    const contentType = req.headers.get("content-type") || "";
    const isForm = contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data");

    if (!user) {
      if (isForm) {
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login?message=Please sign in to subscribe&next=/pricing`, 303);
      }
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (contentType.includes("application/json")) {
      const body = await req.json();
      priceId = body.priceId;
    } else {
      const formData = await req.formData();
      priceId = formData.get("priceId") as string;
    }

    if (!priceId) {
      return NextResponse.json({ error: "Price ID is required" }, { status: 400 });
    }

    // Get the user's profile to pass their email to Stripe
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      billing_address_collection: "required",
      customer_email: user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing?canceled=true`,
      metadata: {
        userId: user.id, // Store the Supabase user ID in metadata to link the subscription later
      },
    });

    // If it's a form submission, redirect the user directly to the Stripe URL
    if (contentType.includes("application/x-www-form-urlencoded") && session.url) {
      return NextResponse.redirect(session.url, 303);
    }

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
