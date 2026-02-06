import mongoose, { Schema, Document } from 'mongoose';

export interface IExpense extends Document {
    name: string;
    category: string;
    amount: number;
    status: 'Active' | 'Paused' | 'Cancelled';
    isMonthly: boolean;
    note?: string;
}

const ExpenseSchema = new Schema<IExpense>({
    name: { type: String, required: true },
    category: { type: String, required: true },
    amount: { type: Number, required: true },
    status: {
        type: String,
        required: true,
        enum: ['Active', 'Paused', 'Cancelled'],
        default: 'Active'
    },
    isMonthly: { type: Boolean, default: true },
    note: { type: String, default: "" },
}, { timestamps: true });

const existingModel = mongoose.models.Expense as mongoose.Model<IExpense> | undefined;
const hasNoteField = Boolean(existingModel?.schema?.path("note"));

if (existingModel && !hasNoteField) {
    delete mongoose.models.Expense;
}

export default mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);
