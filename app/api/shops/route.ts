import connectToDatabase from '@/lib/mongodb';
import Shop from '@/models/Shop';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';

export async function GET() {
    await connectToDatabase();
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const shops = await Shop.find({ ownerId: session.userId }).sort({ name: 1 });
    return NextResponse.json(shops);
}

export async function POST(req: NextRequest) {
    await connectToDatabase();
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { name, area } = await req.json();
    const shop = await Shop.create({ ownerId: session.userId, name, area });
    return NextResponse.json(shop);
}
