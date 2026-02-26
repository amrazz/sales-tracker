import connectToDatabase from '@/lib/mongodb';
import Sale from '@/models/Sale';
import Expense from '@/models/Expense';
import PaymentLog from '@/models/PaymentLog';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
    await connectToDatabase();

    const session = await getAuthSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    let startDate, endDate;

    if (startDateParam && endDateParam) {
        startDate = new Date(startDateParam);
        startDate.setHours(0, 0, 0, 0);

        endDate = new Date(endDateParam);
        endDate.setHours(23, 59, 59, 999);
    } else {
        // Default to today if no dates provided
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);

        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
    }

    const query = {
        ownerId: session.userId,
        date: { $gte: startDate, $lte: endDate }
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
    const totalRevenue = totalCashSales + totalUPISales + totalCreditSales;

    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const totalOldCashReceived = payments.reduce((acc, curr) => acc + curr.amount, 0);

    const netProfit = totalRevenue - totalExpenses;

    return NextResponse.json({
        totalRevenue,
        totalCashSales,
        totalUPISales,
        totalCreditSales,
        totalExpenses,
        totalOldCashReceived,
        netProfit,
        salesCount: sales.length,
        expensesCount: expenses.length,
        paymentsCount: payments.length
    });
}
