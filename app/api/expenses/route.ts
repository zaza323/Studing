import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Expense from '@/models/Expense';
import { logActivity } from '@/lib/activity';

export async function GET() {
    try {
        await dbConnect();
        const expenses = await Expense.find({});
        return NextResponse.json(expenses);
    } catch {
        return NextResponse.json({ error: "Failed to fetch expenses" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const body = await request.json();
    try {
        await dbConnect();
        const expense = await Expense.create(body);
        await logActivity({
            action: "CREATE",
            entity: "Expense",
            description: `تمت إضافة مصروف جديد: ${expense.name}`,
            user: "System",
        });
        return NextResponse.json(expense, { status: 201 });
    } catch {
        return NextResponse.json({ error: "Failed to create expense" }, { status: 500 });
    }
}
