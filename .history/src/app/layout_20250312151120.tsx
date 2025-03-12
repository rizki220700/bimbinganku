// src/app/layout.tsx (Server-side layout, tanpa 'use client' directive)

import { ReactNode } from 'react';
import Header from '@/app/components/Header';
import SidebarDosen from '@/app/components/SidebarDosen';
import './globals.css';

// `metadata` hanya untuk server-side layout
export const metadata = {
    title: 'Bimbingan Online',
    description: 'Platform Bimbingan Online untuk Mahasiswa dan Dosen',
};

interface LayoutProps {
    children: ReactNode;
}

export default function RootLayout({ children }: LayoutProps) {
    return (
        <html lang="en">
            <body>
              
                <SidebarDosen />
                <main className="p-6">{children}</main>
            </body>
        </html>
    );
}
