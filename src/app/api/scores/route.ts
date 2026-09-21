import { NextResponse } from "next/server";
import { ScoreService } from "@/server/services/ScoreService";
import { z } from "zod";

const scoreSchema = z.object({
  score: z.number().int().min(1).max(45),
  score_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
});

export async function GET() {
  try {
    const scores = await ScoreService.getLatestScores();
    return NextResponse.json(scores);
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = scoreSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { score, score_date } = result.data;

    // Prevent future dates
    const inputDate = new Date(score_date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    if (inputDate > today) {
      return NextResponse.json({ error: "Score date cannot be in the future" }, { status: 400 });
    }

    const scores = await ScoreService.addScore(score, score_date);
    return NextResponse.json(scores, { status: 201 });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
