import mongoose, { Schema, Document } from 'mongoose';

export interface IStockLog extends Document {
    ownerId: mongoose.Types.ObjectId;
    productId: mongoose.Types.ObjectId;
    quantity: number;
    type: 'morning' | 'wastage' | 'sales';
    date: Date;
    note?: string;
}

const StockLogSchema: Schema = new Schema({
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    type: { type: String, enum: ['morning', 'wastage', 'sales'], required: true },
    date: { type: Date, default: Date.now },
    note: { type: String }
});

export default mongoose.models.StockLog || mongoose.model<IStockLog>('StockLog', StockLogSchema);
