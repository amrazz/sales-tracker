import connectToDatabase from '@/lib/mongodb';
import { getAuthSession } from '@/lib/auth';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function GET() {
    await connectToDatabase();
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    return NextResponse.json({
        name: session.name,
        phone: session.phone,
        companyName: session.companyName
    });
}

export async function PUT(req: Request) {
    await connectToDatabase();
    const session = await getAuthSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { name, companyName } = await req.json();

    const updatedUser = await User.findByIdAndUpdate(
        session.userId,
        { name, companyName },
        { new: true }
    );

    if (!updatedUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Update session cookie
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_key_123');
    const { SignJWT } = await import('jose');
    const token = await new SignJWT({
        authenticated: true,
        userId: updatedUser._id.toString(),
        name: updatedUser.name,
        phone: updatedUser.phone,
        companyName: updatedUser.companyName
    })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('30d')
        .sign(secret);

    const { cookies } = await import('next/headers');
    (await cookies()).set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
    });

    return NextResponse.json({
        success: true,
        user: {
            name: updatedUser.name,
            companyName: updatedUser.companyName
        }
    });
}
