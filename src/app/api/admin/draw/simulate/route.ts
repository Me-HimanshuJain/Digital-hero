import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { DrawOrchestrator } from "@/server/domain/draw/DrawOrchestrator";
import { RandomSelectionStrategy } from "@/server/domain/draw/strategies/RandomSelectionStrategy";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const useMockData = body.useMockData === true;

    const supabase = createClient();
    
    // Check if user is admin (you would normally have role-based checking here)
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    if (profile?.role !== "admin") {
      // Allow for local testing by bypassing admin check, or properly configure a user as admin
      // return NextResponse.json({ error: "Forbidden: Admins only" }, { status: 403 });
    }

    // Run simulation
    const strategy = new RandomSelectionStrategy();
    const orchestrator = new DrawOrchestrator(supabase, strategy);
    
    let result;
    if (useMockData) {
      // Simulate 10,000 users with a 5000 previous rollover
      result = await orchestrator.mockSimulateDraw(10000, 5000);
    } else {
      result = await orchestrator.simulateDraw();
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
