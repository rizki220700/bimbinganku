'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase/firebaseconfig';
import { FaHome, FaList, FaClipboard, FaCalendarAlt, FaSignOutAlt } from 'react-icons/fa';

const Sidebar = () => {
  const router = useRouter();
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const storedUserData = localStorage.getItem('userData');
        if (storedUserData) {
          const parsedUserData = JSON.parse(storedUserData);
          setUserRole(parsedUserData.role);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      localStorage.removeItem('userProfile');
      router.push('/auth/login');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="h-screen w-64 bg-gray-800 text-white p-5 flex flex-col space-y-4">
      <h2 className="text-xl font-bold">Dashboard Dosen</h2>
      <ul className="space-y-3">
        {userRole === 'dosen' && (
          <>
            <li>
              <Link href="/dashboard/dosen" className="flex items-center space-x-2 hover:text-gray-300">
                <FaHome /> <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link href="/dashboard/dosen/listMahasiswa" className="flex items-center space-x-2 hover:text-gray-300">
                <FaList /> <span>List Mahasiswa</span>
              </Link>
            </li>
            <li>
              <Link href="/dashboard/dosen/pengajuan" className="flex items-center space-x-2 hover:text-gray-300">
                <FaClipboard /> <span>Pengajuan Bimbingan</span>
              </Link>
            </li>
            <li>
              <Link href="/dashboard/dosen/jadwal" className="flex items-center space-x-2 hover:text-gray-300">
                <FaCalendarAlt /> <span>Jadwal Bimbingan</span>
              </Link>
            </li>
          </>
        )}
        <li>
          <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 w-full flex items-center space-x-2">
            <FaSignOutAlt /> <span>Logout</span>
          </button>
        </li>
      </ul>
    </div>
  );
};

export default SidebarDosen;
