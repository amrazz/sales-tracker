import connectToDatabase from '@/lib/mongodb';
import StockLog from '@/models/StockLog';
import Product from '@/models/Product';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
    await connectToDatabase();
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { productId, quantity, type, note } = await req.json();

    const log = await StockLog.create({
        ownerId: session.userId,
        productId,
        quantity,
        type,
        note,
        date: new Date()
    });

    // If it's wastage, we should also decrement the persistent stock
    if (type === 'wastage') {
        await Product.findOneAndUpdate(
            { _id: productId, ownerId: session.userId },
            { $inc: { stock: -quantity } }
        );
    }

    return NextResponse.json(log);
}

export async function GET(req: NextRequest) {
    await connectToDatabase();
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const logs = await StockLog.find({ ownerId: session.userId }).sort({ date: -1 }).populate('productId');
    return NextResponse.json(logs);
}
