import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';

export async function GET() {
    await connectToDatabase();

    const session = await getAuthSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const products = await Product.find({ ownerId: session.userId });
    return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
    await connectToDatabase();

    const session = await getAuthSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { name, unit, price, stock } = await req.json();

    const existing = await Product.findOne({
        ownerId: session.userId,
        name: { $regex: new RegExp(`^${name}$`, 'i') }
    });

    if (existing) {
        return NextResponse.json({ message: 'Product already exists' }, { status: 409 });
    }

    const product = await Product.create({
        ownerId: session.userId,
        name,
        unit,
        price,
        stock: stock || 0
    });
    return NextResponse.json(product);
}
