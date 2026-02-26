import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();

        // Access the underlying native MongoDB driver collection
        const db = mongoose.connection.db;
        if (!db) {
            throw new Error("Database connection not established");
        }

        const usersCollection = db.collection('users');
        const productsCollection = db.collection('products');

        // Try to drop the old username index if it exists
        try {
            await usersCollection.dropIndex('username_1');
            console.log('Successfully dropped old username index.');
        } catch (err: any) {
            if (err.code !== 27) {
                console.log('Could not drop username_1 index (might not exist):', err.message);
            }
        }

        // Try to drop the old product name index if it exists (for multi-tenant support)
        try {
            await productsCollection.dropIndex('name_1');
            console.log('Successfully dropped old product name index.');
        } catch (err: any) {
            if (err.code !== 27) {
                console.log('Could not drop name_1 index (might not exist):', err.message);
            }
        }

        // Drop any potential old phone index that wasn't unique if needed, though Mongoose should handle it

        return NextResponse.json({
            success: true,
            message: 'Successfully purged old MongoDB indexes! You can now register.'
        });

    } catch (error: any) {
        console.error('Index purge failed:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
