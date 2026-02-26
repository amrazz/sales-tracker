import connectToDatabase from '@/lib/mongodb';
import PaymentLog from '@/models/PaymentLog';
import Shop from '@/models/Shop';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
    await connectToDatabase();

    const session = await getAuthSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { shopId, amount } = await req.json();

    const payment = await PaymentLog.create({
        ownerId: session.userId,
        shopId,
        amount,
        date: new Date()
    });

    // Reduce shop's pending balance
    // Reduce shop's pending balance
    await Shop.findOneAndUpdate({ _id: shopId, ownerId: session.userId }, {
        $inc: { pendingBalance: -amount }
    });

    return NextResponse.json(payment);
}

export async function GET(req: NextRequest) {
    await connectToDatabase();
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const shopId = searchParams.get('shopId');

    const query: any = { ownerId: session.userId };
    if (shopId) query.shopId = shopId;

    const payments = await PaymentLog.find(query).populate('shopId').sort({ date: -1 });

    return NextResponse.json(payments);
}
