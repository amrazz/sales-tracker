import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';

export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    await connectToDatabase();
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { id } = await context.params;

    const product = await Product.findOneAndUpdate(
        { _id: id, ownerId: session.userId },
        body,
        { new: true }
    );

    if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    return NextResponse.json(product);
}

export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    await connectToDatabase();
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await context.params;
    const deleted = await Product.findOneAndDelete({ _id: id, ownerId: session.userId });

    if (!deleted) return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    return NextResponse.json({ message: 'Product deleted' });
}
