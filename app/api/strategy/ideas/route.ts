import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Idea } from '@/models/Strategy';
import { logActivity } from "@/lib/activity";

type MemoryIdea = {
    _id: string;
    id?: string;
    title: string;
    content: string;
    category: string;
    color: string;
    createdAt: string;
};

const isProduction = process.env.VERCEL_ENV === "production";

const globalForIdeas = globalThis as unknown as { __memoryIdeas?: MemoryIdea[] };

const getMemoryIdeas = async () => {
    if (!globalForIdeas.__memoryIdeas) {
        const { initialIdeas } = await import("@/lib/store");
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
        if (isProduction) {
            return NextResponse.json([]);
        }
        const ideas = await getMemoryIdeas();
        return NextResponse.json(ideas);
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
        if (isProduction) {
            return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
        }
        const memoryIdea = {
            _id: createMemoryId(),
            ...body,
            createdAt: body.createdAt ?? new Date().toISOString(),
        } as MemoryIdea;
        const ideas = await getMemoryIdeas();
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
