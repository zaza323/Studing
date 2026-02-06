import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Competitor } from '@/models/Strategy';
import { logActivity } from '@/lib/activity';

type MemoryCompetitor = {
    _id: string;
    id?: string;
    name: string;
    logo: string;
    logoUrl?: string;
    strengths: string[];
    weaknesses: string[];
    url: string;
    richNotes?: string;
    images?: string[];
};

const isProduction = process.env.VERCEL_ENV === "production";

const globalForCompetitors = globalThis as unknown as { __memoryCompetitors?: MemoryCompetitor[] };

const getMemoryCompetitors = async () => {
    if (!globalForCompetitors.__memoryCompetitors) {
        const { initialCompetitors } = await import("@/lib/store");
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
        if (isProduction) {
            return NextResponse.json([]);
        }
        const competitors = await getMemoryCompetitors();
        return NextResponse.json(competitors);
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
        if (isProduction) {
            return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
        }
        const memoryCompetitor = { _id: createMemoryId(), ...payload } as MemoryCompetitor;
        const competitors = await getMemoryCompetitors();
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
