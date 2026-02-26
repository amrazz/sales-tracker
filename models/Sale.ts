import mongoose, { Schema, Document } from 'mongoose';

export interface ISaleItem {
    productId: mongoose.Types.ObjectId;
    quantity: number;
    price: number;
}

export interface ISale extends Document {
    ownerId: mongoose.Types.ObjectId;
    shopId: mongoose.Types.ObjectId;
    items: ISaleItem[];
    subtotal: number;
    discount: number;
    totalAmount: number;
    amountPaid: number;
    paymentType: 'cash' | 'upi' | 'credit';
    date: Date;
}

const SaleSchema: Schema = new Schema({
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
    amountPaid: { type: Number, required: true },
    paymentType: { type: String, enum: ['cash', 'upi', 'credit'], required: true },
    date: { type: Date, default: Date.now },
}, { timestamps: true });

// Force model re-registration to pick up schema changes in development
if (mongoose.models && mongoose.models.Sale) {
    delete (mongoose.models as any).Sale;
}

export default mongoose.model<ISale>('Sale', SaleSchema);
