'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const Sidebar = () => {
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = () => {
        // Hapus token admin dari localStorage
        localStorage.removeItem('userToken');
        
        // Redirect ke halaman login admin
        router.push('/auth/admin');
    };

    // Toggle Sidebar
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <div className="flex">
            {/* Tombol Hamburger untuk membuka Sidebar hanya di perangkat kecil */}
            <button 
                onClick={toggleSidebar} 
                className="lg:hidden text-white text-2xl focus:outline-none z-50"
            >
                {isSidebarOpen ? '×' : '☰'}
            </button>

            {/* Sidebar Modal (hanya muncul di perangkat kecil) */}
            <div 
                className={`fixed inset-0 bg-gray-800 bg-opacity-80 z-40 transform transition-all duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} lg:hidden`}
                onClick={() => setIsSidebarOpen(false)}
            >
                <div className="w-64 bg-gray-800 text-white min-h-screen p-6 space-y-6 flex flex-col">
                    <h2 className="text-3xl font-extrabold text-center text-blue-400 mb-8">
                        Admin Dashboard
                    </h2>
                    <div className="space-y-4">
                        {/* Menu Dashboard */}
                        <Link
                            href="/dashboard/admin"
                            className="block text-lg text-gray-300 hover:text-blue-500 hover:scale-105 transform transition-all duration-200 ease-in-out p-2 rounded-lg hover:bg-gray-700"
                        >
                            Dashboard
                        </Link>

                        <Link
                            href="/dashboard/admin/pengguna"
                            className="block text-lg text-gray-300 hover:text-blue-500 hover:scale-105 transform transition-all duration-200 ease-in-out p-2 rounded-lg hover:bg-gray-700"
                        >
                            Data Pengguna
                        </Link>

                        <Link
                            href="/dashboard/admin/pengajuan"
                            className="block text-lg text-gray-300 hover:text-blue-500 hover:scale-105 transform transition-all duration-200 ease-in-out p-2 rounded-lg hover:bg-gray-700"
                        >
                            Data Pengajuan Bimbingan
                        </Link>

                        <Link
                            href="/dashboard/admin/jadwal"
                            className="block text-lg text-gray-300 hover:text-blue-500 hover:scale-105 transform transition-all duration-200 ease-in-out p-2 rounded-lg hover:bg-gray-700"
                        >
                            Data Jadwal Bimbingan
                        </Link>
                    </div>

                    {/* Tombol Logout */}
                    <button
                        onClick={handleLogout}
                        className="mt-auto bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-700 transform transition-all duration-300 ease-in-out hover:scale-105"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Sidebar tetap untuk perangkat besar */}
            <div className="lg:block hidden w-64 bg-gray-800 text-white min-h-screen p-6 space-y-6 flex-col">
                <h2 className="text-3xl font-extrabold text-center text-blue-400 mb-8">
                    Admin Dashboard
                </h2>
                <div className="space-y-4">
                    {/* Menu Dashboard */}
                    <Link
                        href="/dashboard/admin"
                        className="block text-lg text-gray-300 hover:text-blue-500 hover:scale-105 transform transition-all duration-200 ease-in-out p-2 rounded-lg hover:bg-gray-700"
                    >
                        Dashboard
                    </Link>

                    <Link
                        href="/dashboard/admin/pengguna"
                        className="block text-lg text-gray-300 hover:text-blue-500 hover:scale-105 transform transition-all duration-200 ease-in-out p-2 rounded-lg hover:bg-gray-700"
                    >
                        Data Pengguna
                    </Link>

                    <Link
                        href="/dashboard/admin/pengajuan"
                        className="block text-lg text-gray-300 hover:text-blue-500 hover:scale-105 transform transition-all duration-200 ease-in-out p-2 rounded-lg hover:bg-gray-700"
                    >
                        Data Pengajuan Bimbingan
                    </Link>

                    <Link
                        href="/dashboard/admin/jadwal"
                        className="block text-lg text-gray-300 hover:text-blue-500 hover:scale-105 transform transition-all duration-200 ease-in-out p-2 rounded-lg hover:bg-gray-700"
                    >
                        Data Jadwal Bimbingan
                    </Link>
                </div>

                {/* Tombol Logout */}
                <button
                    onClick={handleLogout}
                    className="mt-auto bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-700 transform transition-all duration-300 ease-in-out hover:scale-105"
                >
                    Logout
                </button>
            </div>

            {/* Konten utama yang menyesuaikan dengan sidebar */}
           
        </div>
    );
};

export default Sidebar;
