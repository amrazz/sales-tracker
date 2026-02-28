import connectToDatabase from '@/lib/mongodb';
import Order from '@/models/Order';
import Sale from '@/models/Sale';
import Shop from '@/models/Shop';
import Product from '@/models/Product';
import { NextRequest, NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    await connectToDatabase();
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;
    const { status, paymentInfo } = await req.json();

    const order = await Order.findOne({ _id: id, ownerId: session.userId });
    if (!order) return NextResponse.json({ error: 'Order not found' }, { status: 404 });

    if (status === 'delivered') {
        if (!paymentInfo) {
            return NextResponse.json({ error: 'Payment info required for delivery' }, { status: 400 });
        }

        // 1. Create Sale
        const sale = await Sale.create({
            ownerId: session.userId,
            shopId: order.shopId,
            items: order.items,
            subtotal: order.subtotal,
            discount: order.discount,
            totalAmount: order.totalAmount,
            amountPaid: paymentInfo.amountPaid,
            paymentType: paymentInfo.paymentType,
            date: new Date()
        });

        // 2. Update Shop Balance
        const creditAmount = order.totalAmount - paymentInfo.amountPaid;
        if (creditAmount > 0) {
            await Shop.findByIdAndUpdate(order.shopId, {
                $inc: { pendingBalance: creditAmount }
            });
        }

        // 3. Deduct Stock
        await Promise.all(order.items.map((item: any) =>
            Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } })
        ));

        // 4. Mark Order as Delivered
        order.status = 'delivered';
        order.saleId = sale._id as any;
        await order.save();

        return NextResponse.json({ order, sale });
    } else if (status === 'cancelled') {
        order.status = 'cancelled';
        await order.save();
        return NextResponse.json(order);
    }

    return NextResponse.json({ error: 'Invalid status update' }, { status: 400 });
}
