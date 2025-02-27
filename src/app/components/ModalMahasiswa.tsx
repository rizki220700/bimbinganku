'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/firebase/firebaseconfig';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

interface Mahasiswa {
    id: string;
    name: string;
    nim: string;
    email: string;
    photoURL: string | null;
  }
  
  interface ModalMahasiswaProps {
    isOpen: boolean;
    onClose: () => void;
    mahasiswaList: Mahasiswa[];
  }
  
  const ModalMahasiswa: React.FC<ModalMahasiswaProps> = ({ isOpen, onClose, mahasiswaList }) => {
    const router = useRouter();
  
    if (!isOpen) return null;
  
    const handleViewDetail = (mahasiswaId: string) => {
      router.push(`/detail-mahasiswa/${mahasiswaId}`); // Arahkan ke halaman detail mahasiswa
    };
  
    return (
      <div className="fixed inset-0 z-50 bg-gray-800 bg-opacity-50 flex justify-center items-center">
        <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
          <h2 className="text-xl font-semibold mb-4 text-center">Mahasiswa yang Dibimbing</h2>
          <ul>
            {mahasiswaList.map((mahasiswa) => (
              <li key={mahasiswa.id} className="flex justify-between items-center text-lg mb-2">
                <span>{mahasiswa.name} ({mahasiswa.nim})</span>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-md"
                  onClick={() => handleViewDetail(mahasiswa.id)}
                >
                  Detail
                </button>
              </li>
            ))}
          </ul>
          <button
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg"
            onClick={onClose}
          >
            Tutup
          </button>
        </div>
      </div>
    );
  };
  
  export default ModalMahasiswa;
  
