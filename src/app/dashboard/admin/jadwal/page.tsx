'use client';

import { useState, useEffect } from 'react';
import { db } from '@/firebase/firebaseconfig';
import { collection, deleteDoc, doc, onSnapshot, getDocs, query, where } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import ModalEditJadwal from '@/app/components/ModalEditJadwal';
import { FaTrash, FaEdit } from 'react-icons/fa';
import Sidebar from '@/app/components/Sidebar'; // Import Sidebar

interface JadwalBimbingan {
  id?: string;
  dosenId: string;
  mahasiswaId: string;
  jenis: string;
  location: string;
  status: string;
  timestamp: { seconds: number; nanoseconds: number };
  keterangan: string;
  progress: {
    bab1: boolean;
    bab2: boolean;
    bab3: boolean;
    bab4: boolean;
    bab5: boolean;
  };
}

const JadwalBimbinganPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedJadwalId, setSelectedJadwalId] = useState<string | null>(null);
  const [jadwal, setJadwal] = useState<JadwalBimbingan[]>([]);
  const [mahasiswaList, setMahasiswaList] = useState<{ [key: string]: string }>({});
  const [dosenList, setDosenList] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Mengambil data dosen dan jadwal
  useEffect(() => {
    const unsubscribe = onSnapshot(query(collection(db, 'users'), where('role', '==', 'dosen')), (querySnapshot) => {
      const dosenData: { [key: string]: string } = {};
      querySnapshot.docs.forEach((doc) => {
        dosenData[doc.id] = doc.data().name;
      });
      setDosenList(dosenData);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchMahasiswaList = async () => {
      const mahasiswaSnapshot = await getDocs(collection(db, 'users'));
      const mahasiswaData: { [key: string]: string } = {};
      mahasiswaSnapshot.docs.forEach((doc) => {
        mahasiswaData[doc.id] = doc.data().name;
      });
      setMahasiswaList(mahasiswaData);
    };

    const unsubscribe = onSnapshot(collection(db, 'jadwal-bimbingan'), (querySnapshot) => {
      const jadwalData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as JadwalBimbingan)
      }));
      setJadwal(jadwalData);
    });

    fetchMahasiswaList();
    return () => unsubscribe();
  }, []);

  const handleOpenModal = () => {
    setSelectedJadwalId(null);
    setIsModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleOpenEditModal = (jadwalId: string) => {
    setSelectedJadwalId(jadwalId);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedJadwalId(null);
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    const confirmation = window.confirm("Apakah Anda yakin ingin menghapus jadwal ini?");
    if (!confirmation) return;
    
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'jadwal-bimbingan', id));
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Terjadi kesalahan saat menghapus jadwal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex">
      <Sidebar /> {/* Menyisipkan Sidebar */}

      <div className="flex-1 p-6">
        <button
          onClick={handleOpenModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 mb-4"
        >
          Tambah Jadwal Bimbingan
        </button>

        <ModalEditJadwal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          jadwalId={selectedJadwalId || ''}
          dosenList={dosenList}
          mahasiswaList={mahasiswaList}
        />
        
        <ModalEditJadwal
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          jadwalId={selectedJadwalId || ''}
          dosenList={dosenList}
          mahasiswaList={mahasiswaList}
        />

        <div className="overflow-x-auto">
          <table className="table-auto w-full border-collapse border border-gray-200 shadow-md rounded-lg">
            <thead>
              <tr className="bg-gray-100 text-left text-sm font-semibold">
                <th className="p-3 border border-gray-300">No</th>
                <th className="p-3 border border-gray-300">Mahasiswa</th>
                <th className="p-3 border border-gray-300">Dosen</th>
                <th className="p-3 border border-gray-300">Jenis</th>
                <th className="p-3 border border-gray-300">Waktu/Tanggal</th>
                <th className="p-3 border border-gray-300">Lokasi</th>
                <th className="p-3 border border-gray-300">Progress</th>
                <th className="p-3 border border-gray-300">Keterangan</th>
                <th className="p-3 border border-gray-300">Status</th>
                <th className="p-3 border border-gray-300">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {jadwal.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50 transition duration-300 text-sm">
                  <td className="p-3 border border-gray-200">{index + 1}</td>
                  <td className="p-3 border border-gray-200">{mahasiswaList[item.mahasiswaId] || 'Memuat...'}</td>
                  <td className="p-3 border border-gray-200">{dosenList[item.dosenId] || 'Memuat...'}</td>
                  <td className="p-3 border border-gray-200">{item.jenis}</td>
                  <td className="p-3 border border-gray-200">
                    {item.timestamp ? new Date(item.timestamp.seconds * 1000).toLocaleString() : 'N/A'}
                  </td>
                  <td className="p-3 border border-gray-200">{item.location}</td>
                  <td className="p-3 border border-gray-200">
                    {Object.entries(item.progress)
                      .filter(([_, status]) => status)
                      .map(([bab]) => bab)
                      .join(', ')}
                  </td>
                  <td className="p-3 border border-gray-200">{item.keterangan}</td>
                  <td className="p-3 border border-gray-200">{item.status}</td>
                  <td className="p-3 border border-gray-200 flex gap-2 text-lg">
                    <FaTrash
                      onClick={() => handleDelete(item.id)}
                      className="text-red-500 cursor-pointer hover:text-red-700 transition duration-300"
                    />
                    <FaEdit
                      onClick={() => handleOpenEditModal(item.id || '')}
                      className="text-blue-500 cursor-pointer hover:text-blue-700 transition duration-300"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default JadwalBimbinganPage;
