'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar'; // Pastikan import Sidebar di sini

const AdminDashboardPage = () => {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('userToken');

        if (token) {
            try {
                const parsedToken = JSON.parse(token);
                if (parsedToken.role === 'admin') {
                    setIsAuthorized(true);
                } else {
                    alert('Akses ditolak! Anda bukan admin.');
                    router.push('/auth/admin');
                }
            } catch (error) {
                console.error('Token error:', error);
                router.push('/auth/admin');
            }
        } else {
            alert('Akses ditolak! Anda harus login terlebih dahulu.');
            router.push('/auth/admin');
        }
    }, [router]);

    if (!isAuthorized) {
        return <p className="text-white text-center mt-10">Memuat...</p>;
    }

    return (
        <div className="flex min-h-screen bg-gray-900 text-white">
            {/* Sidebar */}
            <Sidebar />
            
            <div className="flex-1 p-6">
                <h1 className="text-4xl font-bold">Admin Dashboard</h1>
                <p className="mt-4">Selamat datang di halaman admin.</p>

              
            </div>
        </div>
    );
};

export default AdminDashboardPage;
