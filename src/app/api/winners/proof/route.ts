import { NextResponse } from "next/server";
import { WinnerVerificationService } from "@/server/services/WinnerVerificationService";

export async function POST(req: Request) {
  try {
    const { winnerId, storagePath } = await req.json();

    if (!winnerId || !storagePath) {
      return NextResponse.json({ error: "Missing winnerId or storagePath" }, { status: 400 });
    }

    const proof = await WinnerVerificationService.submitProof(winnerId, storagePath);
    return NextResponse.json({ success: true, proof });
  } catch (error: any) {
    if (error.message === "Unauthorized") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
