import { NextResponse } from "next/server";
import { CharityService } from "@/server/services/CharityService";

export async function GET() {
  try {
    const userCharity = await CharityService.getUserCharity();
    return NextResponse.json({ userCharity });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { charityId, percentage } = await req.json();

    if (!charityId) {
      return NextResponse.json({ error: "charityId is required" }, { status: 400 });
    }
    if (!percentage || typeof percentage !== 'number') {
      return NextResponse.json({ error: "percentage must be a number" }, { status: 400 });
    }

    const updated = await CharityService.setUserCharity(charityId, percentage);
    return NextResponse.json(updated);
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
