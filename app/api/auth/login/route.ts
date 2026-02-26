import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

async function hashPassword(password: string) {
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();
        const { phone, password } = await req.json();

        if (!phone || !password) {
            return NextResponse.json({ success: false, message: 'Phone and password are required' }, { status: 400 });
        }

        const user = await User.findOne({ phone });
        if (!user) {
            return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
        }

        const inputHash = await hashPassword(password);
        if (inputHash !== user.passwordHash) {
            return NextResponse.json({ success: false, message: 'Invalid credentials' }, { status: 401 });
        }

        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_key_123');
        const token = await new SignJWT({
            authenticated: true,
            userId: user._id.toString(),
            name: user.name,
            phone: user.phone
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('30d')
            .sign(secret);

        (await cookies()).set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax', // Changed to lax for Next.js navigation stability
            maxAge: 30 * 24 * 60 * 60, // 30 days
            path: '/',
        });

        return NextResponse.json({ success: true, user: { id: user._id, name: user.name } });

    } catch (error) {
        console.error('Login Error:', error);
        return NextResponse.json({ success: false, message: 'Server error during login' }, { status: 500 });
    }
}
