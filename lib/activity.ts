import dbConnect from "@/lib/db";
import Activity from "@/models/Activity";

export type ActivityAction = "CREATE" | "UPDATE" | "DELETE" | "COMPLETE";

type MemoryActivity = {
    _id: string;
    action: ActivityAction;
    entity: string;
    description: string;
    user: string;
    createdAt: string;
};

const globalForActivities = globalThis as unknown as { __memoryActivities?: MemoryActivity[] };

const getMemoryActivities = () => {
    if (!globalForActivities.__memoryActivities) {
        globalForActivities.__memoryActivities = [];
    }
    return globalForActivities.__memoryActivities;
};

export const getRecentMemoryActivities = (limit: number) => {
    return getMemoryActivities().slice(0, limit);
};

export async function logActivity({
    action,
    entity,
    description,
    user = "System",
}: {
    action: ActivityAction;
    entity: string;
    description: string;
    user?: string;
}) {
    try {
        await dbConnect();
        return await Activity.create({ action, entity, description, user });
    } catch {
        const memoryActivities = getMemoryActivities();
        const entry: MemoryActivity = {
            _id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
            action,
            entity,
            description,
            user,
            createdAt: new Date().toISOString(),
        };
        memoryActivities.unshift(entry);
        if (memoryActivities.length > 100) {
            memoryActivities.pop();
        }
        return entry;
    }
}
