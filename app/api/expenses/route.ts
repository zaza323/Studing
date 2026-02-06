import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Expense from '@/models/Expense';
import { budget } from "@/lib/store";
import { logActivity } from '@/lib/activity';

type MemoryExpense = (typeof budget.monthlyCosts)[number] & { _id: string };

const globalForExpenses = globalThis as unknown as { __memoryExpenses?: MemoryExpense[] };

const getMemoryExpenses = () => {
    if (!globalForExpenses.__memoryExpenses) {
        globalForExpenses.__memoryExpenses = budget.monthlyCosts.map((expense) => ({
            ...expense,
            _id: expense.id,
        }));
    }
    return globalForExpenses.__memoryExpenses;
};

const createMemoryId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export async function GET() {
    try {
        await dbConnect();
        const expenses = await Expense.find({});
        return NextResponse.json(expenses);
    } catch {
        return NextResponse.json(getMemoryExpenses());
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
        const memoryExpense = { _id: createMemoryId(), ...body } as MemoryExpense;
        const expenses = getMemoryExpenses();
        expenses.push(memoryExpense);
        await logActivity({
            action: "CREATE",
            entity: "Expense",
            description: `تمت إضافة مصروف جديد: ${memoryExpense.name}`,
            user: "System",
        });
        return NextResponse.json(memoryExpense, { status: 201 });
    }
}
