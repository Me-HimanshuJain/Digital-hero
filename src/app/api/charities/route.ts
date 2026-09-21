import { NextResponse } from "next/server";
import { CharityService } from "@/server/services/CharityService";

export async function GET() {
  try {
    const charities = await CharityService.getCharities();
    return NextResponse.json(charities);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
