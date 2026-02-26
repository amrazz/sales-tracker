import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

export async function getAuthSession() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) return null;

        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_secret_key_123');
        const { payload } = await jwtVerify(token, secret);

        if (!payload.userId) return null;

        return {
            userId: payload.userId as string,
            name: payload.name as string,
            phone: payload.phone as string,
        };
    } catch (error) {
        return null;
    }
}
