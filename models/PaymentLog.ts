import mongoose, { Schema, Document } from 'mongoose';

export interface IPaymentLog extends Document {
    ownerId: mongoose.Types.ObjectId;
    shopId: mongoose.Types.ObjectId;
    amount: number;
    date: Date;
}

const PaymentLogSchema: Schema = new Schema({
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    shopId: { type: Schema.Types.ObjectId, ref: 'Shop', required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.models.PaymentLog || mongoose.model<IPaymentLog>('PaymentLog', PaymentLogSchema);
