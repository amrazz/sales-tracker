import connectToDatabase from '@/lib/mongodb';
import Expense from '@/models/Expense';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
    await connectToDatabase();
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { description, amount } = await req.json();

    const expense = await Expense.create({
        ownerId: session.userId,
        description,
        amount,
        date: new Date()
    });

    return NextResponse.json(expense);
}

export async function GET(req: NextRequest) {
    await connectToDatabase();
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const expenses = await Expense.find({
        ownerId: session.userId,
        date: { $gte: startOfDay }
    }).sort({ date: -1 });

    return NextResponse.json(expenses);
}
