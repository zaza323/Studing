import mongoose, { Schema, Document } from "mongoose";

export interface IActivity extends Document {
    action: string;
    entity: string;
    description: string;
    user: string;
    createdAt: Date;
}

const ActivitySchema = new Schema<IActivity>({
    action: { type: String, required: true },
    entity: { type: String, required: true },
    description: { type: String, required: true },
    user: { type: String, default: "System" },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Activity || mongoose.model<IActivity>("Activity", ActivitySchema);
