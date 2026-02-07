import dbConnect from "@/lib/db";
import Activity from "@/models/Activity";

export type ActivityAction = "CREATE" | "UPDATE" | "DELETE" | "COMPLETE";

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
    await dbConnect();
    return await Activity.create({ action, entity, description, user });
}
