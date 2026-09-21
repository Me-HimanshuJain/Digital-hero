import { createAdminClient } from "@/lib/supabase/admin";
import { stripe } from "@/lib/stripe/config";

export class SubscriptionService {
  /**
   * Handle successful checkout session to provision a subscription
   */
  static async handleCheckoutSessionCompleted(session: any) {
    const supabase = createAdminClient();
    const userId = session.metadata?.userId;
    const subscriptionId = session.subscription;
    const customerId = session.customer;

    if (!userId) {
      console.error("Missing userId in Stripe checkout session metadata");
      return;
    }

    // Retrieve subscription details from Stripe
    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    const priceId = stripeSubscription.items.data[0].price.id;

    // Find the subscription plan in Supabase
    const { data: plan } = await supabase
      .from("subscription_plans")
      .select("id")
      .eq("stripe_price_id", priceId)
      .single();

    if (!plan) {
      console.error(`Subscription plan not found in database for price ${priceId}`);
      // Usually, you might sync the plan from Stripe if it doesn't exist, but for now log it.
      return;
    }

    const { error: insertError } = await supabase
      .from("subscriptions")
      .upsert({
        user_id: userId,
        plan_id: plan.id,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        status: stripeSubscription.status,
        start_at: new Date(
          ((stripeSubscription as any).current_period_start || stripeSubscription.items.data[0].current_period_start) * 1000
        ).toISOString(),
        renewal_at: new Date(
          ((stripeSubscription as any).current_period_end || stripeSubscription.items.data[0].current_period_end) * 1000
        ).toISOString(),
        canceled_at: stripeSubscription.cancel_at ? new Date(stripeSubscription.cancel_at * 1000).toISOString() : null,
      }, { onConflict: 'stripe_subscription_id' });

    if (insertError) {
      console.error("Error provisioning subscription in Supabase:", insertError);
    }
  }

  /**
   * Handle subscription updates (cancellations, renewals, payment failures)
   */
  static async handleSubscriptionUpdated(subscription: any) {
    const supabase = createAdminClient();
    const subscriptionId = subscription.id;

    const { error } = await supabase
      .from("subscriptions")
      .update({
        status: subscription.status,
        renewal_at: new Date(
          ((subscription as any).current_period_end || subscription.items.data[0].current_period_end) * 1000
        ).toISOString(),
        canceled_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
      })
      .eq("stripe_subscription_id", subscriptionId);

    if (error) {
      console.error("Error updating subscription in Supabase:", error);
    }
  }

  /**
   * Handle deleted subscriptions
   */
  static async handleSubscriptionDeleted(subscription: any) {
    const supabase = createAdminClient();
    const subscriptionId = subscription.id;

    const { error } = await supabase
      .from("subscriptions")
      .update({
        status: 'canceled',
        canceled_at: new Date().toISOString(),
      })
      .eq("stripe_subscription_id", subscriptionId);

    if (error) {
      console.error("Error deleting subscription in Supabase:", error);
    }
  }
}
