import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
        return new NextResponse('Missing token', { status: 400 });
    }

    try {
        await auth.verifyIdToken(token);
    } catch {
        return new NextResponse('Invalid or expired token', { status: 401 });
    }

    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.set('__auth_session', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'none', // Required for iframe embedding across origins
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
    });

    return response;
}
