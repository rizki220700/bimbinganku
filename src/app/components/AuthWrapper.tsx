'use client'; // Tandai sebagai komponen client-side

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface AuthWrapperProps {
    children: React.ReactNode;
    allowedRoles: string[]; // Menentukan peran yang diizinkan
}

const AuthWrapper = ({ children, allowedRoles }: AuthWrapperProps) => {
    const [userRole, setUserRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Ambil data user dari localStorage
        const userData = localStorage.getItem('userData');
        
        if (userData) {
            const parsedUserData = JSON.parse(userData);
            const role = parsedUserData?.role;

            if (role) {
                setUserRole(role);

                // Jika role tidak sesuai dengan allowedRoles, redirect ke halaman unauthorized
                if (!allowedRoles.includes(role)) {
                    router.push('/unauthorized');
                }

                // Logika untuk redirect dashboard sesuai role
                const currentPath = window.location.pathname;
                if (role === 'mahasiswa' && currentPath.includes('/dashboard/dosen')) {
                    router.push('/dashboard/mahasiswa'); // Redirect mahasiswa ke dashboard mahasiswa
                } else if (role === 'dosen' && currentPath.includes('/dashboard/mahasiswa')) {
                    router.push('/dashboard/dosen'); // Redirect dosen ke dashboard dosen
                }
            } else {
                // Jika tidak ada role, arahkan ke halaman login
                router.push('/auth/login');
            }
        } else {
            // Jika tidak ada data user, arahkan ke halaman login
            router.push('/auth/login');
        }

        setLoading(false);
    }, [router, allowedRoles]);

    if (loading) return <p>Loading...</p>;

    return <>{children}</>;
};

export default AuthWrapper;
