import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import Sale from '@/models/Sale';
import Product from '@/models/Product';
import Shop from '@/models/Shop';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
    await connectToDatabase();
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { shopId, items, subtotal, discount, totalAmount, deliveryDate } = await req.json();

    const order = await Order.create({
        ownerId: session.userId,
        shopId,
        items,
        subtotal,
        discount,
        totalAmount,
        deliveryDate: new Date(deliveryDate),
        status: 'pending'
    });

    return NextResponse.json(order);
}

export async function GET(req: NextRequest) {
    await connectToDatabase();
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');

    const query: any = { ownerId: session.userId };

    if (status) {
        query.status = status;
    }

    if (startDateParam && endDateParam) {
        const startDate = new Date(startDateParam);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(endDateParam);
        endDate.setHours(23, 59, 59, 999);
        query.deliveryDate = { $gte: startDate, $lte: endDate };
    }

    const orders = await Order.find(query)
        .populate('shopId')
        .populate('items.productId')
        .sort({ deliveryDate: 1 });

    return NextResponse.json(orders);
}
