import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Milestone from '@/models/Milestone';
import { logActivity } from '@/lib/activity';
type MemoryMilestone = {
    _id: string;
    id?: string;
    phase: string;
    description: string;
    startDate: string;
    endDate: string;
    isComplete: boolean;
    isCurrent: boolean;
};

const isProduction = process.env.VERCEL_ENV === "production";

const globalForMilestones = globalThis as unknown as { __memoryMilestones?: MemoryMilestone[] };

const getMemoryMilestones = async () => {
    if (!globalForMilestones.__memoryMilestones) {
        const { milestones: seedMilestones } = await import("@/lib/store");
        globalForMilestones.__memoryMilestones = seedMilestones.map((milestone) => ({
            ...milestone,
            _id: milestone.id,
        }));
    }
    return globalForMilestones.__memoryMilestones;
};

const createMemoryId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export async function GET() {
    try {
        await dbConnect();
        const milestones = await Milestone.find({}).sort({ startDate: 1 });
        return NextResponse.json(milestones);
    } catch {
        if (isProduction) {
            return NextResponse.json([]);
        }
        const milestones = await getMemoryMilestones();
        const sorted = [...milestones].sort((a, b) => a.startDate.localeCompare(b.startDate));
        return NextResponse.json(sorted);
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
        if (isProduction) {
            return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
        }
        const memoryMilestone = { _id: createMemoryId(), ...body } as MemoryMilestone;
        const milestones = await getMemoryMilestones();
        milestones.push(memoryMilestone);
        await logActivity({
            action: "CREATE",
            entity: "Timeline",
            description: `تمت إضافة مرحلة جديدة: ${memoryMilestone.phase}`,
            user: "System",
        });
        return NextResponse.json(memoryMilestone, { status: 201 });
    }
}
