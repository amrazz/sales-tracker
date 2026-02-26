import connectToDatabase from '@/lib/mongodb';
import Sale from '@/models/Sale';
import Shop from '@/models/Shop'; // required for population
import Product from '@/models/Product'; // required for population
import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
    await connectToDatabase();
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { shopId, items, subtotal, discount, totalAmount, amountPaid, paymentType } = await req.json();

    const sale = await Sale.create({
        ownerId: session.userId,
        shopId,
        items,
        subtotal,
        discount,
        totalAmount,
        amountPaid,
        paymentType,
        date: new Date()
    });

    // Automatically calculate and add any unpaid amount to credit ledger
    const creditAmount = totalAmount - amountPaid;
    if (creditAmount > 0) {
        await Shop.findByIdAndUpdate(shopId, {
            $inc: { pendingBalance: creditAmount }
        });
    }

    // Deduct stock for each sold item
    await Promise.all(items.map((item: any) =>
        Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } })
    ));

    return NextResponse.json(sale);
}

export async function GET(req: NextRequest) {
    await connectToDatabase();
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const shopId = searchParams.get('shopId');
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    const query: any = { ownerId: session.userId };

    if (shopId) {
        query.shopId = shopId;
    }

    if (startDateParam && endDateParam) {
        const startDate = new Date(startDateParam);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(endDateParam);
        endDate.setHours(23, 59, 59, 999);

        query.date = { $gte: startDate, $lte: endDate };
    }

    const sales = await Sale.find(query)
        .populate('shopId')
        .populate('items.productId')
        .sort({ date: -1 });

    return NextResponse.json(sales);
}
