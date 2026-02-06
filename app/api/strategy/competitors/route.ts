import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Competitor } from '@/models/Strategy';
import { initialCompetitors } from "@/lib/store";
import { logActivity } from '@/lib/activity';

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

const normalizeCompetitor = (body: Record<string, unknown>) => ({
    ...body,
    logo: typeof body.logo === "string" ? body.logo : "bg-indigo-500",
    logoUrl: typeof body.logoUrl === "string" ? body.logoUrl : "",
    richNotes: typeof body.richNotes === "string" ? body.richNotes : "",
    images: Array.isArray(body.images) ? body.images : [],
});

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
    const payload = normalizeCompetitor(body);
    try {
        await dbConnect();
        const competitor = await Competitor.create(payload);
        await logActivity({
            action: "CREATE",
            entity: "Competitor",
            description: `تمت إضافة منافس جديد: ${competitor.name}`,
            user: "System",
        });
        return NextResponse.json(competitor, { status: 201 });
    } catch {
        const memoryCompetitor = { _id: createMemoryId(), ...payload } as MemoryCompetitor;
        const competitors = getMemoryCompetitors();
        competitors.push(memoryCompetitor);
        await logActivity({
            action: "CREATE",
            entity: "Competitor",
            description: `تمت إضافة منافس جديد: ${memoryCompetitor.name}`,
            user: "System",
        });
        return NextResponse.json(memoryCompetitor, { status: 201 });
    }
}
