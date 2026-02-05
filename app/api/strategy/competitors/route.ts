import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Competitor } from '@/models/Strategy';
import { initialCompetitors } from "@/lib/store";

type MemoryCompetitor = (typeof initialCompetitors)[number] & { _id: string };

const globalForCompetitors = globalThis as unknown as { __memoryCompetitors?: MemoryCompetitor[] };

const getMemoryCompetitors = () => {
    if (!globalForCompetitors.__memoryCompetitors) {
        globalForCompetitors.__memoryCompetitors = initialCompetitors.map((competitor) => ({
            ...competitor,
            _id: competitor.id,
        }));
    }
    return globalForCompetitors.__memoryCompetitors;
};

const createMemoryId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export async function GET() {
    try {
        await dbConnect();
        const competitors = await Competitor.find({});
        return NextResponse.json(competitors);
    } catch {
        return NextResponse.json(getMemoryCompetitors());
    }
}

export async function POST(request: Request) {
    const body = await request.json();
    try {
        await dbConnect();
        const competitor = await Competitor.create(body);
        return NextResponse.json(competitor, { status: 201 });
    } catch {
        const memoryCompetitor = { _id: createMemoryId(), ...body } as MemoryCompetitor;
        const competitors = getMemoryCompetitors();
        competitors.push(memoryCompetitor);
        return NextResponse.json(memoryCompetitor, { status: 201 });
    }
}
