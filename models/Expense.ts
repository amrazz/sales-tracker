import mongoose, { Schema, Document } from 'mongoose';

export interface IExpense extends Document {
    ownerId: mongoose.Types.ObjectId;
    description: string;
    amount: number;
    date: Date;
}

const ExpenseSchema: Schema = new Schema({
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
}, { timestamps: true });

export default mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);
