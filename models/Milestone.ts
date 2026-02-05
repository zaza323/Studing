import mongoose, { Schema, Document } from 'mongoose';

export interface IMilestone extends Document {
    phase: string;
    description: string;
    startDate: string; // Storing as string to match existing frontend format YYYY-MM-DD
    endDate: string;
    isComplete: boolean;
    isCurrent: boolean;
}

const MilestoneSchema = new Schema<IMilestone>({
    phase: { type: String, required: true },
    description: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    isComplete: { type: Boolean, default: false },
    isCurrent: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.Milestone || mongoose.model<IMilestone>('Milestone', MilestoneSchema);
