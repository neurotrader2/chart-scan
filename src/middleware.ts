import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const userAgent = request.headers.get('user-agent') || '';

    // List of bot keywords to block
    const botPatterns = ['bot', 'crawl', 'spider', 'scrape', 'python', 'curl', 'wget'];

    if (botPatterns.some(pattern => userAgent.toLowerCase().includes(pattern))) {
        return new NextResponse('Access Denied', { status: 403 });
    }

    return NextResponse.next();
}

export const config = {
    matcher: '/:path*',
};
