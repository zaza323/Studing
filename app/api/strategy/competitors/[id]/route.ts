import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Competitor } from "@/models/Strategy";
import { logActivity } from "@/lib/activity";

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

const normalizeCompetitor = (body: Record<string, unknown>) => ({
    ...body,
    logo: typeof body.logo === "string" ? body.logo : "bg-indigo-500",
    logoUrl: typeof body.logoUrl === "string" ? body.logoUrl : "",
    richNotes: typeof body.richNotes === "string" ? body.richNotes : "",
    images: Array.isArray(body.images) ? body.images : [],
});

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const body = await request.json();
    const payload = normalizeCompetitor(body);
    try {
        await dbConnect();
        const competitor = await Competitor.findByIdAndUpdate(id, payload, { new: true, runValidators: true });

        if (!competitor) {
            return NextResponse.json({ error: "Competitor not found" }, { status: 404 });
        }

        await logActivity({
            action: "UPDATE",
            entity: "Competitor",
            description: `تم تحديث منافس: ${competitor.name}`,
            user: "System",
        });
        return NextResponse.json(competitor);
    } catch {
        if (isProduction) {
            return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
        }
        const competitors = await getMemoryCompetitors();
        const index = competitors.findIndex((c) => c._id === id || c.id === id);
        if (index === -1) {
            return NextResponse.json({ error: "Competitor not found" }, { status: 404 });
        }
        const updated = { ...competitors[index], ...payload, _id: competitors[index]._id };
        competitors[index] = updated;
        await logActivity({
            action: "UPDATE",
            entity: "Competitor",
            description: `تم تحديث منافس: ${updated.name}`,
            user: "System",
        });
        return NextResponse.json(updated);
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        await dbConnect();
        const competitor = await Competitor.findByIdAndDelete(id);

        if (!competitor) {
            return NextResponse.json({ error: "Competitor not found" }, { status: 404 });
        }

        await logActivity({
            action: "DELETE",
            entity: "Competitor",
            description: `تم حذف منافس: ${competitor.name}`,
            user: "System",
        });
        return NextResponse.json({ message: "Competitor deleted successfully" });
    } catch {
        if (isProduction) {
            return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
        }
        const competitors = await getMemoryCompetitors();
        const index = competitors.findIndex((c) => c._id === id || c.id === id);
        if (index === -1) {
            return NextResponse.json({ error: "Competitor not found" }, { status: 404 });
        }
        const removed = competitors.splice(index, 1)[0];
        await logActivity({
            action: "DELETE",
            entity: "Competitor",
            description: `تم حذف منافس: ${removed.name}`,
            user: "System",
        });
        return NextResponse.json({ message: "Competitor deleted successfully" });
    }
}
