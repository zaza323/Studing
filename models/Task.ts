import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
    title: string;
    description: string;
    status: 'قيد الانتظار' | 'قيد التنفيذ' | 'مكتملة';
    priority: 'عالية' | 'متوسطة' | 'منخفضة';
    assignee: string;
}

const TaskSchema = new Schema<ITask>({
    title: { type: String, required: true },
    description: { type: String },
    status: {
        type: String,
        required: true,
        enum: ['قيد الانتظار', 'قيد التنفيذ', 'مكتملة'],
        default: 'قيد الانتظار'
    },
    priority: {
        type: String,
        required: true,
        enum: ['عالية', 'متوسطة', 'منخفضة'],
        default: 'متوسطة'
    },
    assignee: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);
