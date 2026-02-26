import connectToDatabase from '@/lib/mongodb';
import Shop from '@/models/Shop';
import Sale from '@/models/Sale';
import PaymentLog from '@/models/PaymentLog';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    await connectToDatabase();
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await context.params;
    const shop = await Shop.findOne({ _id: id, ownerId: session.userId });
    if (!shop) return NextResponse.json({ message: 'Shop not found' }, { status: 404 });
    return NextResponse.json(shop);
}

export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    await connectToDatabase();
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await context.params;
    const body = await req.json();
    const shop = await Shop.findOneAndUpdate(
        { _id: id, ownerId: session.userId },
        body,
        { new: true }
    );

    if (!shop) return NextResponse.json({ message: 'Shop not found' }, { status: 404 });
    return NextResponse.json(shop);
}

export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    await connectToDatabase();
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await context.params;

    const deleted = await Shop.findOneAndDelete({ _id: id, ownerId: session.userId });
    if (!deleted) return NextResponse.json({ message: 'Shop not found' }, { status: 404 });

    // Optional: Delete associated sales and payments to clean up DB
    await Sale.deleteMany({ shopId: id, ownerId: session.userId });
    await PaymentLog.deleteMany({ shopId: id }); // PaymentLog needs ownerId too, we'll fix later if needed

    return NextResponse.json({ message: 'Shop and associated records deleted' });
}
