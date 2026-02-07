import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Competitor } from '@/models/Strategy';
import { logActivity } from '@/lib/activity';

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
        return NextResponse.json({ error: "Failed to fetch competitors" }, { status: 500 });
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
        return NextResponse.json({ error: "Failed to create competitor" }, { status: 500 });
    }
}
