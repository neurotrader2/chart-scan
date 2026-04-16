import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    if (process.env.NODE_ENV === 'development') {
        return NextResponse.next();
    }

    const userAgent = request.headers.get('user-agent') || '';
    const botPatterns = ['bot', 'crawl', 'spider', 'scrape', 'python', 'curl', 'wget'];

    if (botPatterns.some(pattern => userAgent.toLowerCase().includes(pattern))) {
        if (request.nextUrl.pathname.startsWith('/_next/') || request.nextUrl.pathname.startsWith('/api/')) {
            return NextResponse.next();
        }
        return new NextResponse('Access Denied', { status: 403 });
    }

    const token = request.nextUrl.searchParams.get('token');
    const sessionCookie = request.cookies.get('__auth_session')?.value;

    if (!token && !sessionCookie) {
        return new NextResponse(
            'Unauthorized: Must be accessed from OrangutanAlpha',
            { status: 401 }
        );
    }

    if (token) {
        const authUrl = new URL('/api/auth', request.url);
        authUrl.searchParams.set('token', token);
        return NextResponse.redirect(authUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
