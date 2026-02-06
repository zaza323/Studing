import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Task from '@/models/Task';
import { logActivity } from '@/lib/activity';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    try {
        const { id } = await params;
        const body = await request.json();
        const existingTask = await Task.findById(id);
        const task = await Task.findByIdAndUpdate(id, body, { new: true, runValidators: true });

        if (!task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        if (task) {
            const isCompleted = body.status === "مكتملة" && existingTask?.status !== "مكتملة";
            await logActivity({
                action: isCompleted ? "COMPLETE" : "UPDATE",
                entity: "Task",
                description: isCompleted
                    ? `تم إكمال مهمة: ${task.title}`
                    : `تم تحديث مهمة: ${task.title}`,
                user: "System",
            });
        }
        return NextResponse.json(task);
    } catch {
        return NextResponse.json({ error: 'Failed to update task' }, { status: 400 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    try {
        const { id } = await params;
        const task = await Task.findByIdAndDelete(id);

        if (!task) {
            return NextResponse.json({ error: 'Task not found' }, { status: 404 });
        }

        await logActivity({
            action: "DELETE",
            entity: "Task",
            description: `تم حذف مهمة: ${task.title}`,
            user: "System",
        });
        return NextResponse.json({ message: 'Task deleted successfully' });
    } catch {
        return NextResponse.json({ error: 'Failed to delete task' }, { status: 400 });
    }
}
