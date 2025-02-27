import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
    const token = req.cookies.get('userToken');

    if (!token) {
        return NextResponse.redirect(new URL('/auth/admin', req.url));
    }

    try {
        const parsedToken = JSON.parse(token.value);
        if (parsedToken.role !== 'admin') {
            return NextResponse.redirect(new URL('/auth/admin', req.url));
        }
    } catch (error) {
        return NextResponse.redirect(new URL('/auth/admin', req.url));
    }
}

// Tentukan halaman yang diproteksi
export const config = {
    matcher: ['/dashboard/admin/:path*'],
};
