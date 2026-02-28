import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
    productId: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
}

export interface IOrder extends Document {
    ownerId: mongoose.Types.ObjectId;
    shopId: mongoose.Types.ObjectId;
    items: IOrderItem[];
    subtotal: number;
    discount: number;
    totalAmount: number;
    orderDate: Date;
    deliveryDate: Date;
    status: 'pending' | 'delivered' | 'cancelled';
    saleId?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const OrderSchema: Schema = new Schema({
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
    items: [{
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
    }],
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    orderDate: { type: Date, default: Date.now },
    deliveryDate: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'delivered', 'cancelled'], default: 'pending' },
    saleId: { type: Schema.Types.ObjectId, ref: 'Sale' },
}, { timestamps: true });

// Force model re-registration to pick up schema changes
if (mongoose.models && mongoose.models.Order) {
    delete (mongoose.models as any).Order;
}

export default mongoose.model<IOrder>('Order', OrderSchema);
