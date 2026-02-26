import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Shop from '@/models/Shop';
import Product from '@/models/Product';
import Sale from '@/models/Sale';
import Expense from '@/models/Expense';
import PaymentLog from '@/models/PaymentLog';
import StockLog from '@/models/StockLog';

async function hashPassword(password: string) {
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function GET(req: NextRequest) {
    try {
        await connectToDatabase();

        // 1. Create Default Admin User if it doesn't exist
        let admin = await User.findOne({ phone: '1234567890' });

        if (!admin) {
            const passwordHash = await hashPassword('password123'); // Default simple password
            admin = await User.create({
                name: 'System Admin',
                phone: '1234567890',
                passwordHash
            });
            console.log('Created admin user:', admin._id);
        }

        const adminId = admin._id;

        // 2. Migrate existing records to have ownerId = adminId
        // Update Shops
        const shopsResult = await Shop.updateMany(
            { ownerId: { $exists: false } },
            { $set: { ownerId: adminId } }
        );

        // Update Products
        const productsResult = await Product.updateMany(
            { ownerId: { $exists: false } },
            { $set: { ownerId: adminId } }
        );

        // Update Sales
        const salesResult = await Sale.updateMany(
            { ownerId: { $exists: false } },
            { $set: { ownerId: adminId } }
        );

        // Update Expenses
        const expensesResult = await Expense.updateMany(
            { ownerId: { $exists: false } },
            { $set: { ownerId: adminId } }
        );

        // Update PaymentLogs
        const paymentsResult = await PaymentLog.updateMany(
            { ownerId: { $exists: false } },
            { $set: { ownerId: adminId } }
        );

        // Update StockLogs
        const stockLogsResult = await StockLog.updateMany(
            { ownerId: { $exists: false } },
            { $set: { ownerId: adminId } }
        );

        return NextResponse.json({
            success: true,
            message: 'Migration completed successfully!',
            adminUserId: adminId,
            defaultPassword: 'password123',
            stats: {
                shopsMigrated: shopsResult.modifiedCount,
                productsMigrated: productsResult.modifiedCount,
                salesMigrated: salesResult.modifiedCount,
                expensesMigrated: expensesResult.modifiedCount,
                paymentsMigrated: paymentsResult.modifiedCount,
                stockLogsMigrated: stockLogsResult.modifiedCount,
            }
        });

    } catch (error: any) {
        console.error('Migration failed:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
