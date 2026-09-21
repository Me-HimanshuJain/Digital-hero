import { NextResponse } from "next/server";
import { WinnerVerificationService } from "@/server/services/WinnerVerificationService";

export async function POST(req: Request) {
  try {
    const { proofId, action, adminNotes } = await req.json();

    if (!proofId || !action) {
      return NextResponse.json({ error: "Missing proofId or action" }, { status: 400 });
    }

    if (action === "approve") {
      const result = await WinnerVerificationService.verifyProof(proofId, adminNotes);
      return NextResponse.json(result);
    } else if (action === "reject") {
      if (!adminNotes) return NextResponse.json({ error: "Rejection reason (adminNotes) is required" }, { status: 400 });
      const result = await WinnerVerificationService.rejectProof(proofId, adminNotes);
      return NextResponse.json(result);
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
