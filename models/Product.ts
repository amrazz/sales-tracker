import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
    ownerId: mongoose.Types.ObjectId;
    name: string;
    unit: string;
    price: number;
    stock: number;
}

const ProductSchema: Schema = new Schema({
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true }, // Removed global unique constraint to allow multiple users to have 'Pepsi'
    unit: { type: String, required: true },
    price: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
}, { timestamps: true });

// Prevent mongoose out of sync schema during Next.js hot reload
if (mongoose.models.Product) {
    delete mongoose.models.Product;
}

export default mongoose.model<IProduct>('Product', ProductSchema);
