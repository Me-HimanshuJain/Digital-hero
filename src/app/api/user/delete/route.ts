import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function DELETE(request: Request) {
  try {
    // 1. Authenticate the user calling the route
    const supabase = createClient();
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // 2. Initialize the Supabase Admin client to bypass RLS and use auth.admin methods
    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        }
      }
    );

    // 3. Delete relational records in a specific order to avoid foreign key constraints
    
    // (Optional) Cancel Stripe Subscription here if you have the customer ID
    // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
    // ...

    // Delete Scores
    await supabaseAdmin.from('scores').delete().eq('user_id', userId);
    
    // Delete User Charities (Preferences)
    await supabaseAdmin.from('user_charities').delete().eq('user_id', userId);
    
    // Delete Subscriptions
    await supabaseAdmin.from('subscriptions').delete().eq('user_id', userId);
    
    // Delete Profile (This is safe now because children records are gone)
    await supabaseAdmin.from('profiles').delete().eq('id', userId);

    // 4. Delete the Auth User
    const { error: deleteUserError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    
    if (deleteUserError) {
      throw deleteUserError;
    }

    return NextResponse.json({ success: true });
    
  } catch (error: any) {
    console.error("Account Deletion Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete account" },
      { status: 500 }
    );
  }
}
