// src/app/page.tsx

import Link from 'next/link';

export default function HomePage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-4xl font-bold mb-4">Selamat Datang di Sistem Bimbingan!</h1>
            <p className="mb-4">Silakan login untuk mengakses fitur lengkap.</p>
            <Link href="/auth/login">
                <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                    Login
                </button>
            </Link>
        </div>
    );
}
