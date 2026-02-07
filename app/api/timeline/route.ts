import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Milestone from '@/models/Milestone';
import { logActivity } from '@/lib/activity';

export async function GET() {
    try {
        await dbConnect();
        const milestones = await Milestone.find({}).sort({ startDate: 1 });
        return NextResponse.json(milestones);
    } catch {
        return NextResponse.json({ error: "Failed to fetch milestones" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const body = await request.json();
    try {
        await dbConnect();
        const milestone = await Milestone.create(body);
        await logActivity({
            action: "CREATE",
            entity: "Timeline",
            description: `تمت إضافة مرحلة جديدة: ${milestone.phase}`,
            user: "System",
        });
        return NextResponse.json(milestone, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Failed to create milestone" }, { status: 500 });
    }
}
