import connectToDatabase from '@/lib/mongodb';
import Sale from '@/models/Sale';
import Expense from '@/models/Expense';
import PaymentLog from '@/models/PaymentLog';
import Shop from '@/models/Shop';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
    await connectToDatabase();

    const session = await getAuthSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const query = {
        ownerId: session.userId,
        date: { $gte: startOfDay }
    };

    const [sales, expenses, payments] = await Promise.all([
        Sale.find(query),
        Expense.find(query),
        PaymentLog.find(query)
    ]);
    const getPaid = (s: any) => s.amountPaid !== undefined && s.amountPaid !== null ? s.amountPaid : (s.paymentType === 'credit' ? 0 : s.totalAmount);
    const getCredit = (s: any) => (s.totalAmount || 0) - getPaid(s);

    const totalCashSales = sales.reduce((acc, curr) => curr.paymentType === 'cash' ? acc + getPaid(curr) : acc, 0);
    const totalUPISales = sales.reduce((acc, curr) => curr.paymentType === 'upi' ? acc + getPaid(curr) : acc, 0);
    const totalCreditSales = sales.reduce((acc, curr) => acc + getCredit(curr), 0);
    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const totalOldCashReceived = payments.reduce((acc, curr) => acc + curr.amount, 0);

    // Cash Expected = Cash sales - Expenses + Old cash received
    const totalCashExpected = totalCashSales - totalExpenses + totalOldCashReceived;

    const allShops = await Shop.find({ ownerId: session.userId });
    const totalPendingCredits = allShops.reduce((acc, curr) => acc + (curr.pendingBalance || 0), 0);

    return NextResponse.json({
        totalCashSales,
        totalUPISales,
        totalCreditSales,
        totalExpenses,
        totalOldCashReceived,
        totalCashExpected,
        totalPendingCredits
    });
}
