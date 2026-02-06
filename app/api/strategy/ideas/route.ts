import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Idea } from '@/models/Strategy';
import { initialIdeas } from "@/lib/store";
import { logActivity } from "@/lib/activity";

type MemoryIdea = (typeof initialIdeas)[number] & { _id: string };

const globalForIdeas = globalThis as unknown as { __memoryIdeas?: MemoryIdea[] };

const getMemoryIdeas = () => {
    if (!globalForIdeas.__memoryIdeas) {
        globalForIdeas.__memoryIdeas = initialIdeas.map((idea) => ({
            ...idea,
            _id: idea.id,
        }));
    }
    return globalForIdeas.__memoryIdeas;
};

const createMemoryId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export async function GET() {
    try {
        await dbConnect();
        const ideas = await Idea.find({});
        return NextResponse.json(ideas);
    } catch {
        return NextResponse.json(getMemoryIdeas());
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
        const memoryIdea = {
            _id: createMemoryId(),
            ...body,
            createdAt: body.createdAt ?? new Date().toISOString(),
        } as MemoryIdea;
        const ideas = getMemoryIdeas();
        ideas.push(memoryIdea);
        await logActivity({
            action: "CREATE",
            entity: "Idea",
            description: `تمت إضافة فكرة جديدة: ${memoryIdea.title}`,
            user: "System",
        });
        return NextResponse.json(memoryIdea, { status: 201 });
    }
}
