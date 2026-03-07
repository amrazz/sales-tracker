import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    name: string;
    companyName?: string;
    phone: string; // Used for login instead of username
    passwordHash: string;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema({
    name: { type: String, required: true },
    companyName: { type: String },
    phone: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
}, { timestamps: true });

if (mongoose.models.User) {
    delete mongoose.models.User;
}

export default mongoose.model<IUser>('User', UserSchema);
