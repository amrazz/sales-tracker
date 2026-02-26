import connectToDatabase from '@/lib/mongodb';
import Sale from '@/models/Sale';
import Shop from '@/models/Shop'; // required for population
import Product from '@/models/Product'; // required for population
import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        await connectToDatabase();
        const session = await getAuthSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await context.params;

        if (!id) {
            return NextResponse.json({ error: 'Sale ID required' }, { status: 400 });
        }

        const sale = await Sale.findOne({ _id: id, ownerId: session.userId })
            .populate('shopId')
            .populate('items.productId');

        if (!sale) {
            return NextResponse.json({ error: 'Sale not found' }, { status: 404 });
        }

        return NextResponse.json(sale);
    } catch (error) {
        console.error('Error fetching sale:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
