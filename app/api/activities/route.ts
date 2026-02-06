import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Activity from "@/models/Activity";
import { getRecentMemoryActivities } from "@/lib/activity";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        await dbConnect();
        const activities = await Activity.find({})
            .sort({ createdAt: -1 })
            .limit(5);
        return NextResponse.json(activities);
    } catch {
        return NextResponse.json(getRecentMemoryActivities(5));
    }
}
