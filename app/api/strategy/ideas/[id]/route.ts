import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Idea } from "@/models/Strategy";
import { logActivity } from "@/lib/activity";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const body = await request.json();
    try {
        await dbConnect();
        const idea = await Idea.findByIdAndUpdate(id, body, { new: true, runValidators: true });

        if (!idea) {
            return NextResponse.json({ error: "Idea not found" }, { status: 404 });
        }

        await logActivity({
            action: "UPDATE",
            entity: "Idea",
            description: `تم تحديث فكرة: ${idea.title}`,
            user: "System",
        });
        return NextResponse.json(idea);
    } catch {
        return NextResponse.json({ error: "Failed to update idea" }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        await dbConnect();
        const idea = await Idea.findByIdAndDelete(id);

        if (!idea) {
            return NextResponse.json({ error: "Idea not found" }, { status: 404 });
        }

        await logActivity({
            action: "DELETE",
            entity: "Idea",
            description: `تم حذف فكرة: ${idea.title}`,
            user: "System",
        });
        return NextResponse.json({ message: "Idea deleted successfully" });
    } catch {
        return NextResponse.json({ error: "Failed to delete idea" }, { status: 500 });
    }
}
