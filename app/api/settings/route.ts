import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Settings from "@/models/Settings";

const SETTINGS_KEY = "global";

export async function GET() {
    try {
        await dbConnect();
        const settings = await Settings.findOne({ key: SETTINGS_KEY });
        if (settings) {
            return NextResponse.json(settings);
        }
        const created = await Settings.create({ key: SETTINGS_KEY });
        return NextResponse.json(created);
    } catch {
        return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
    }
}

export async function PUT(request: Request) {
    try {
        await dbConnect();
        const body = await request.json();
        const update: Partial<{
            totalBudget: number;
            launchDate: string;
            revenuePerStudent: number;
        }> = {};

        if (typeof body.totalBudget === "number" && Number.isFinite(body.totalBudget)) {
            update.totalBudget = body.totalBudget;
        }
        if (typeof body.launchDate === "string" && body.launchDate.trim()) {
            update.launchDate = body.launchDate;
        }
        if (typeof body.revenuePerStudent === "number" && Number.isFinite(body.revenuePerStudent)) {
            update.revenuePerStudent = body.revenuePerStudent;
        }

        const settings = await Settings.findOneAndUpdate(
            { key: SETTINGS_KEY },
            { $set: update, $setOnInsert: { key: SETTINGS_KEY } },
            { new: true, upsert: true, runValidators: true }
        );
        return NextResponse.json(settings);
    } catch {
        return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
    }
}
