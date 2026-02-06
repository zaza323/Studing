import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Expense from '@/models/Expense';
import { logActivity } from '@/lib/activity';

type MemoryExpense = {
    _id: string;
    id?: string;
    name: string;
    category: string;
    amount: number;
    status: string;
    billingDate?: string;
    note?: string;
};

const isProduction = process.env.VERCEL_ENV === "production";

const globalForExpenses = globalThis as unknown as { __memoryExpenses?: MemoryExpense[] };

const getMemoryExpenses = async () => {
    if (!globalForExpenses.__memoryExpenses) {
        const { budget } = await import("@/lib/store");
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
        if (isProduction) {
            return NextResponse.json([]);
        }
        const expenses = await getMemoryExpenses();
        return NextResponse.json(expenses);
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
        if (isProduction) {
            return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
        }
        const memoryExpense = { _id: createMemoryId(), ...body } as MemoryExpense;
        const expenses = await getMemoryExpenses();
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
