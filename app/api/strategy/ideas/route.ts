import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Idea } from '@/models/Strategy';
import { logActivity } from "@/lib/activity";

export async function GET() {
    try {
        await dbConnect();
        const ideas = await Idea.find({});
        return NextResponse.json(ideas);
    } catch {
        return NextResponse.json({ error: "Failed to fetch ideas" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const body = await request.json();
    try {
        await dbConnect();
        const idea = await Idea.create(body);
        await logActivity({
            action: "CREATE",
            entity: "Idea",
            description: `تمت إضافة فكرة جديدة: ${idea.title}`,
            user: "System",
        });
        return NextResponse.json(idea, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Failed to create idea" }, { status: 500 });
    }
}
