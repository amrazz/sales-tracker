import mongoose, { Schema, Document } from 'mongoose';

export interface IShop extends Document {
    ownerId: mongoose.Types.ObjectId;
    name: string;
    area: string;
    pendingBalance: number;
}

const ShopSchema: Schema = new Schema({
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    area: { type: String, required: true },
    pendingBalance: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.Shop || mongoose.model<IShop>('Shop', ShopSchema);
