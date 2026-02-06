import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Task from '@/models/Task';
import { logActivity } from '@/lib/activity';
type MemoryTask = {
    _id: string;
    id?: string;
    title: string;
    description: string;
    status: string;
    assignee: string;
    priority: string;
};

const isProduction = process.env.VERCEL_ENV === "production";

const globalForTasks = globalThis as unknown as { __memoryTasks?: MemoryTask[] };

const getMemoryTasks = async () => {
    if (!globalForTasks.__memoryTasks) {
        const { tasks: seedTasks } = await import("@/lib/store");
        globalForTasks.__memoryTasks = seedTasks.map((task) => ({
            ...task,
            _id: task.id,
        }));
    }
    return globalForTasks.__memoryTasks;
};

const createMemoryId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export async function GET(request: Request) {
    const url = new URL(request.url);
    const shouldMigrate = url.searchParams.get("migrate") === "1";
    try {
        await dbConnect();

        if (shouldMigrate) {
            const statusMap: Record<string, string> = {
                Todo: "قيد الانتظار",
                "In Progress": "قيد التنفيذ",
                Done: "مكتملة",
            };
            const priorityMap: Record<string, string> = {
                High: "عالية",
                Medium: "متوسطة",
                Low: "منخفضة",
            };

            let updatedFields = 0;
            for (const [from, to] of Object.entries(statusMap)) {
                const res = await Task.updateMany({ status: from }, { $set: { status: to } });
                updatedFields += res.modifiedCount ?? 0;
            }

            for (const [from, to] of Object.entries(priorityMap)) {
                const res = await Task.updateMany({ priority: from }, { $set: { priority: to } });
                updatedFields += res.modifiedCount ?? 0;
            }

            const totalTasks = await Task.countDocuments();
            return NextResponse.json({ updatedFields, totalTasks });
        }

        const tasks = await Task.find({});
        const normalized = tasks.map((task) => {
            const plain = typeof task.toObject === "function" ? task.toObject() : task;
            const statusMap: Record<string, string> = {
                Todo: "قيد الانتظار",
                "In Progress": "قيد التنفيذ",
                Done: "مكتملة",
            };
            const priorityMap: Record<string, string> = {
                High: "عالية",
                Medium: "متوسطة",
                Low: "منخفضة",
            };
            const status = statusMap[plain.status] ?? plain.status;
            const priority = priorityMap[plain.priority] ?? plain.priority;
            return { ...plain, status, priority };
        });
        return NextResponse.json(normalized);
    } catch {
        if (shouldMigrate) {
            return NextResponse.json({ error: "Failed to migrate tasks" }, { status: 500 });
        }
        if (isProduction) {
            return NextResponse.json([]);
        }
        const tasks = await getMemoryTasks();
        return NextResponse.json(tasks);
    }
}

export async function POST(request: Request) {
    const body = await request.json();
    try {
        await dbConnect();
        const task = await Task.create(body);
        await logActivity({
            action: "CREATE",
            entity: "Task",
            description: `تم إنشاء مهمة جديدة: ${task.title}`,
            user: "System",
        });
        return NextResponse.json(task, { status: 201 });
    } catch {
        if (isProduction) {
            return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
        }
        const memoryTask = { _id: createMemoryId(), ...body } as MemoryTask;
        const tasks = await getMemoryTasks();
        tasks.push(memoryTask);
        await logActivity({
            action: "CREATE",
            entity: "Task",
            description: `تم إنشاء مهمة جديدة: ${memoryTask.title}`,
            user: "System",
        });
        return NextResponse.json(memoryTask, { status: 201 });
    }
}
