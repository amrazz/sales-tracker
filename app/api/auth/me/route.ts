import connectToDatabase from '@/lib/mongodb';
import { getAuthSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
    await connectToDatabase();
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    return NextResponse.json({
        name: session.name,
        phone: session.phone
    });
}
