import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Competitor } from "@/models/Strategy";
import { logActivity } from "@/lib/activity";

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
        return NextResponse.json({ error: "Failed to update competitor" }, { status: 500 });
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
        return NextResponse.json({ error: "Failed to delete competitor" }, { status: 500 });
    }
}
