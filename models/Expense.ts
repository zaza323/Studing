import mongoose, { Schema, Document } from 'mongoose';

export interface IExpense extends Document {
    name: string;
    category: string;
    amount: number;
    status: 'Active' | 'Paused' | 'Cancelled';
    isMonthly: boolean;
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
}, { timestamps: true });

export default mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);
