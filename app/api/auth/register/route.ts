import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

// Very basic hash function for demonstration (In production, use bcryptjs)
// Note: We cannot use standard bcrypt in Edge runtime/server actions easily without external deps, 
// so we'll simulate a secure hash or require the user to install bcryptjs. 
// For this app, we will use a simple crypto hash via Web Crypto API natively available in Node/Edge.
async function hashPassword(password: string) {
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function POST(req: NextRequest) {
    try {
        await connectToDatabase();
        const { name, phone, password } = await req.json();

        if (!name || !phone || !password) {
            return NextResponse.json({ success: false, message: 'All fields are required' }, { status: 400 });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ phone });
        if (existingUser) {
            return NextResponse.json({ success: false, message: 'Phone number already registered' }, { status: 409 });
        }

        const passwordHash = await hashPassword(password);

        const newUser = await User.create({
            name,
            phone,
            passwordHash
        });

        // Automatically log them in after registration
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_key_123');
        const token = await new SignJWT({
            authenticated: true,
            userId: newUser._id.toString(),
            name: newUser.name,
            phone: newUser.phone
        })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('30d')
            .sign(secret);

        (await cookies()).set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60, // 30 days
            path: '/',
        });

        return NextResponse.json({ success: true, user: { id: newUser._id, name: newUser.name } });

    } catch (error) {
        console.error('Registration Error:', error);
        return NextResponse.json({ success: false, message: 'Server error during registration' }, { status: 500 });
    }
}
