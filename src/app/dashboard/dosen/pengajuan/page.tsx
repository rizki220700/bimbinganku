'use client'

import { useState, useEffect } from 'react';
import { db } from '@/firebase/firebaseconfig';
import { collection, updateDoc, doc, onSnapshot, getDoc } from 'firebase/firestore';
import { FaDownload, FaCheck, FaTimes } from 'react-icons/fa';
import Select from 'react-select'; // Impor react-select

interface PengajuanBimbingan {
  id?: string;
  dosen: string;
  fileURL: string;
  pesan: string;
  status: string;
  timestamp: { seconds: number, nanoseconds: number };
  userId: string;
}

interface User {
  name: string;
  email: string;
}

const PengajuanBimbinganPage = () => {
  const [pengajuan, setPengajuan] = useState<PengajuanBimbingan[]>([]); // Data pengajuan
  const [loading, setLoading] = useState(true);
  const [mahasiswaNames, setMahasiswaNames] = useState<{ [key: string]: string }>({}); // Menyimpan nama mahasiswa berdasarkan userId
  const [filteredPengajuan, setFilteredPengajuan] = useState<PengajuanBimbingan[]>([]); // Pengajuan yang difilter
  const [selectedMahasiswa, setSelectedMahasiswa] = useState<any>(null); // Mahasiswa yang dipilih
  const [dosenId, setDosenId] = useState<string | null>(null); // Dosen ID

  // Ambil dosenId dari localStorage
  useEffect(() => {
    const storedDosenId = localStorage.getItem('userProfile');
    if (storedDosenId) {
      const userProfile = JSON.parse(storedDosenId);
      setDosenId(userProfile.userId); // Set dosenId ketika tersedia
    }
  }, []);

  // Ambil data pengajuan bimbingan dan filter berdasarkan dosenId
  useEffect(() => {
    if (!dosenId) return; // Pastikan dosenId tersedia

    const unsubscribe = onSnapshot(collection(db, 'pengajuan-bimbingan'), (querySnapshot) => {
      const pengajuanData = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...(doc.data() as PengajuanBimbingan)
        }))
        .filter(item => item.dosen === dosenId); // Filter berdasarkan dosenId

      setPengajuan(pengajuanData);
      setLoading(false);

      // Ambil nama mahasiswa berdasarkan userId
      pengajuanData.forEach(async (item) => {
        if (!mahasiswaNames[item.userId]) {
          const userRef = doc(db, 'users', item.userId);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            setMahasiswaNames(prev => ({
              ...prev,
              [item.userId]: userDoc.data()?.name || 'Nama tidak ditemukan',
            }));
          }
        }
      });
    });

    return () => unsubscribe();
  }, [dosenId, mahasiswaNames]); // Menggunakan dosenId sebagai dependensi

  // Mengubah pengajuan yang ditampilkan berdasarkan filter nama mahasiswa
  useEffect(() => {
    if (selectedMahasiswa) {
      setFilteredPengajuan(pengajuan.filter(item => mahasiswaNames[item.userId] === selectedMahasiswa.label));
    } else {
      setFilteredPengajuan(pengajuan);
    }
  }, [selectedMahasiswa, pengajuan, mahasiswaNames]);

  const handleDownload = (fileURL: string) => {
    const link = document.createElement('a');
    link.href = fileURL;
    link.target = '_blank';
    link.download = fileURL.split('/').pop() || 'file';
    link.click();
  };

  const handleTerima = async (id: string) => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'pengajuan-bimbingan', id), { status: 'Accepted' });
    } catch (error) {
      console.error('Error updating:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTolak = async (id: string) => {
    setLoading(true);
    try {
      await updateDoc(doc(db, 'pengajuan-bimbingan', id), { status: 'Rejected' });
    } catch (error) {
      console.error('Error updating:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk format timestamp menjadi tanggal yang bisa dibaca
  const formatTimestamp = (timestamp: { seconds: number, nanoseconds: number }) => {
    const date = new Date(timestamp.seconds * 1000); // Mengubah detik ke milidetik
    return date.toLocaleString('id-ID', { // Format tanggal Indonesia
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <h1 className="text-xl font-semibold mb-4">Loading Pengajuan Bimbingan...</h1>
      </div>
    );
  }

  // Persiapkan opsi untuk react-select berdasarkan mahasiswa
  const mahasiswaOptions = Object.keys(mahasiswaNames).map(userId => ({
    label: mahasiswaNames[userId],
    value: userId
  }));

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">List Pengajuan Bimbingan</h1>
      
      {/* Filter Mahasiswa */}
      <div className="mb-4">
        <Select
          options={mahasiswaOptions}
          onChange={setSelectedMahasiswa}
          value={selectedMahasiswa}
          placeholder="Filter by Mahasiswa"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="table-auto w-full border-collapse border border-gray-200 shadow-md rounded-lg">
          <thead>
            <tr className="bg-gray-100 text-left text-sm font-semibold">
              <th className="p-3 border border-gray-300">No</th>
              <th className="p-3 border border-gray-300">Mahasiswa</th>
              <th className="p-3 border border-gray-300">Pesan</th>
              <th className="p-3 border border-gray-300">File</th>
              <th className="p-3 border border-gray-300">Status</th>
              <th className="p-3 border border-gray-300">Tanggal Pengajuan</th>
              <th className="p-3 border border-gray-300">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredPengajuan.map((item, index) => (
              <tr key={item.id} className="hover:bg-gray-50 transition duration-300 text-sm">
                <td className="p-3 border border-gray-200">{index + 1}</td>
                <td className="p-3 border border-gray-200">{mahasiswaNames[item.userId]}</td>
                <td className="p-3 border border-gray-200">{item.pesan}</td>
                <td className="p-3 border border-gray-200">
                  <FaDownload 
                    onClick={() => handleDownload(item.fileURL)} 
                    className="text-blue-500 cursor-pointer hover:text-blue-700 transition duration-300" 
                  />
                </td>
                <td className="p-3 border border-gray-200">{item.status}</td>
                <td className="p-3 border border-gray-200">{formatTimestamp(item.timestamp)}</td>
                <td className="p-3 border border-gray-200 flex gap-2">
                 
                  <>
                  <button 
                    onClick={() => handleTerima(item.id!)} 
                    className="bg-yellow-500 text-white font-bold py-2 px-4 rounded hover:bg-yellow-700 transition duration-300"
                  >
                    Terima
                  </button>
                  <button 
                    onClick={() => handleTolak(item.id!)} 
                    className="bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-700 transition duration-300 ml-2"
                  >
                    Tolak
                  </button>
                </>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PengajuanBimbinganPage;
