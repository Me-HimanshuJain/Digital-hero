import { NextResponse } from "next/server";
import { ScoreService } from "@/server/services/ScoreService";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    if (!id) {
      return NextResponse.json({ error: "Score ID is required" }, { status: 400 });
    }

    const scores = await ScoreService.deleteScore(id);
    return NextResponse.json(scores);
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
