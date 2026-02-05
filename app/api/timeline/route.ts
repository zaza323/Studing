import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Milestone from '@/models/Milestone';
import { milestones as seedMilestones } from "@/lib/store";

type MemoryMilestone = (typeof seedMilestones)[number] & { _id: string };

const globalForMilestones = globalThis as unknown as { __memoryMilestones?: MemoryMilestone[] };

const getMemoryMilestones = () => {
    if (!globalForMilestones.__memoryMilestones) {
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
        const milestones = getMemoryMilestones();
        const sorted = [...milestones].sort((a, b) => a.startDate.localeCompare(b.startDate));
        return NextResponse.json(sorted);
    }
}

export async function POST(request: Request) {
    const body = await request.json();
    try {
        await dbConnect();
        const milestone = await Milestone.create(body);
        return NextResponse.json(milestone, { status: 201 });
    } catch {
        const memoryMilestone = { _id: createMemoryId(), ...body } as MemoryMilestone;
        const milestones = getMemoryMilestones();
        milestones.push(memoryMilestone);
        return NextResponse.json(memoryMilestone, { status: 201 });
    }
}
