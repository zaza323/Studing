import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Competitor } from "@/models/Strategy";
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

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const body = await request.json();
    try {
        await dbConnect();
        const competitor = await Competitor.findByIdAndUpdate(id, body, { new: true, runValidators: true });

        if (!competitor) {
            return NextResponse.json({ error: "Competitor not found" }, { status: 404 });
        }

        return NextResponse.json(competitor);
    } catch {
        const competitors = getMemoryCompetitors();
        const index = competitors.findIndex((c) => c._id === id || c.id === id);
        if (index === -1) {
            return NextResponse.json({ error: "Competitor not found" }, { status: 404 });
        }
        const updated = { ...competitors[index], ...body, _id: competitors[index]._id };
        competitors[index] = updated;
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

        return NextResponse.json({ message: "Competitor deleted successfully" });
    } catch {
        const competitors = getMemoryCompetitors();
        const index = competitors.findIndex((c) => c._id === id || c.id === id);
        if (index === -1) {
            return NextResponse.json({ error: "Competitor not found" }, { status: 404 });
        }
        competitors.splice(index, 1);
        return NextResponse.json({ message: "Competitor deleted successfully" });
    }
}
