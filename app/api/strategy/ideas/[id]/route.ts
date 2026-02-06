import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Idea } from "@/models/Strategy";
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
        if (isProduction) {
            return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
        }
        const ideas = await getMemoryIdeas();
        const index = ideas.findIndex((i) => i._id === id || i.id === id);
        if (index === -1) {
            return NextResponse.json({ error: "Idea not found" }, { status: 404 });
        }
        const updated = { ...ideas[index], ...body, _id: ideas[index]._id };
        ideas[index] = updated;
        await logActivity({
            action: "UPDATE",
            entity: "Idea",
            description: `تم تحديث فكرة: ${updated.title}`,
            user: "System",
        });
        return NextResponse.json(updated);
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
        if (isProduction) {
            return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
        }
        const ideas = await getMemoryIdeas();
        const index = ideas.findIndex((i) => i._id === id || i.id === id);
        if (index === -1) {
            return NextResponse.json({ error: "Idea not found" }, { status: 404 });
        }
        const removed = ideas.splice(index, 1)[0];
        await logActivity({
            action: "DELETE",
            entity: "Idea",
            description: `تم حذف فكرة: ${removed.title}`,
            user: "System",
        });
        return NextResponse.json({ message: "Idea deleted successfully" });
    }
}
