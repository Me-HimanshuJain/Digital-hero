import { NextResponse } from "next/server";
import { WinnerVerificationService } from "@/server/services/WinnerVerificationService";

export async function POST(req: Request) {
  try {
    const { winnerId, transactionReference, amount } = await req.json();

    if (!winnerId || !transactionReference || !amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await WinnerVerificationService.markAsPaid(winnerId, transactionReference, amount);
    return NextResponse.json(result);
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden") {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
