import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Competitor } from "@/models/Strategy";
import { initialCompetitors } from "@/lib/store";
import { logActivity } from "@/lib/activity";

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
        const competitors = getMemoryCompetitors();
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
        const competitors = getMemoryCompetitors();
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
