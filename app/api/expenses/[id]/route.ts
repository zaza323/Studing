import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Expense from '@/models/Expense';
import { logActivity } from '@/lib/activity';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    try {
        const { id } = await params;
        const body = await request.json();
        const expense = await Expense.findByIdAndUpdate(id, body, { new: true, runValidators: true });

        if (!expense) {
            return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
        }

        await logActivity({
            action: "UPDATE",
            entity: "Expense",
            description: `تم تحديث مصروف: ${expense.name}`,
            user: "System",
        });
        return NextResponse.json(expense);
    } catch {
        return NextResponse.json({ error: 'Failed to update expense' }, { status: 400 });
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    try {
        const { id } = await params;
        const expense = await Expense.findByIdAndDelete(id);

        if (!expense) {
            return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
        }

        await logActivity({
            action: "DELETE",
            entity: "Expense",
            description: `تم حذف مصروف: ${expense.name}`,
            user: "System",
        });
        return NextResponse.json({ message: 'Expense deleted successfully' });
    } catch {
        return NextResponse.json({ error: 'Failed to delete expense' }, { status: 400 });
    }
}
