"use server";

import { ScoreService, ScoreData } from "@/server/services/ScoreService";
import { z } from "zod";

const scoreSchema = z.object({
  score: z.number().int().min(1).max(45),
  score_date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
});

export async function getLatestScoresAction(): Promise<ScoreData[]> {
  try {
    return await ScoreService.getLatestScores();
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      throw new Error("Unauthorized");
    }
    throw new Error(error.message);
  }
}

export async function addScoreAction(score: number, score_date: string): Promise<ScoreData[]> {
  try {
    const result = scoreSchema.safeParse({ score, score_date });
    if (!result.success) {
      throw new Error(result.error.issues[0].message);
    }

    // Prevent future dates
    const inputDate = new Date(score_date);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    if (inputDate > today) {
      throw new Error("Score date cannot be in the future");
    }

    return await ScoreService.addScore(score, score_date);
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      throw new Error("Unauthorized");
    }
    throw new Error(error.message);
  }
}

export async function deleteScoreAction(id: string): Promise<ScoreData[]> {
  try {
    if (!id) {
      throw new Error("Score ID is required");
    }
    return await ScoreService.deleteScore(id);
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      throw new Error("Unauthorized");
    }
    throw new Error(error.message);
  }
}
