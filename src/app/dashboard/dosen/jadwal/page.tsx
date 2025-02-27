'use client'

import { useState, useEffect } from 'react';
import { db } from '@/firebase/firebaseconfig';
import { collection, deleteDoc, doc, updateDoc, onSnapshot, getDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import ModalJadwalBimbingan from '@/app/components/ModalJadwalBimbingan';
import ModalEditJadwalBimbingan from '@/app/components/ModalEditJadwalBimbingan'; // Import ModalEditJadwalBimbingan
import { FaTrash, FaEdit } from 'react-icons/fa';

interface JadwalBimbingan {
  id?: string;
  dosenId: string;
  mahasiswaId: string;
  jenis: string;
  location: string;
  status: string;
  timestamp: { seconds: number, nanoseconds: number };
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
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // State for edit modal
  const [selectedJadwalId, setSelectedJadwalId] = useState<string | null>(null); // State for selected jadwal ID
  const [dosenId, setDosenId] = useState('');
  const [jadwal, setJadwal] = useState<JadwalBimbingan[]>([]);
  const [mahasiswaNames, setMahasiswaNames] = useState<{ [key: string]: string }>({}); // State for mahasiswa names
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedDosenId = localStorage.getItem('userProfile');
    if (storedDosenId) {
      const userProfile = JSON.parse(storedDosenId);
      setDosenId(userProfile.userId);
    }
  }, []); // This effect runs only once to get the dosenId from localStorage
  
  useEffect(() => {
    if (!dosenId) return; // Only run when dosenId is available
  
    const unsubscribe = onSnapshot(collection(db, 'jadwal-bimbingan'), (querySnapshot) => {
      const jadwalData = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...(doc.data() as JadwalBimbingan)
        }))
        .filter(item => item.dosenId === dosenId); // Filter jadwal based on dosenId
  
      setJadwal(jadwalData);
  
      // Ambil nama mahasiswa berdasarkan mahasiswaId
      jadwalData.forEach(async (item) => {
        if (!mahasiswaNames[item.mahasiswaId]) { // Fetch mahasiswa name if not already fetched
          const mahasiswaDoc = await getDoc(doc(db, 'users', item.mahasiswaId));
          if (mahasiswaDoc.exists()) {
            setMahasiswaNames(prevState => ({
              ...prevState,
              [item.mahasiswaId]: mahasiswaDoc.data().name // Ganti 'name' sesuai dengan field nama di collection users
            }));
          }
        }
      });
    });
  
    return () => unsubscribe();
  }, [dosenId]); // Only runs when dosenId is available
  

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const handleOpenEditModal = (jadwalId: string) => {
    setSelectedJadwalId(jadwalId); // Set the selected jadwalId
    setIsEditModalOpen(true); // Open edit modal
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedJadwalId(null); // Clear selected jadwalId when closing the modal
  };

  const handleDelete = async (id?: string) => {
    if (!id) return;
    setLoading(true);
    try {
      await deleteDoc(doc(db, 'jadwal-bimbingan', id));
    } catch (error) {
      console.error('Error deleting:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id?: string) => {
    if (!id) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'jadwal-bimbingan', id), {}); // Implement the actual update logic here
    } catch (error) {
      console.error('Error updating:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <button onClick={handleOpenModal} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-300 mb-4">
        Tambah Jadwal Bimbingan
      </button>

      {/* ModalJadwalBimbingan */}
      <ModalJadwalBimbingan 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        dosenId={dosenId} 
      />

      {/* ModalEditJadwalBimbingan */}
      <ModalEditJadwalBimbingan 
        isOpen={isEditModalOpen} 
        onClose={handleCloseEditModal} 
        jadwalId={selectedJadwalId || ''} 
      />

      <div className="overflow-x-auto">
        <table className="table-auto w-full border-collapse border border-gray-200 shadow-md rounded-lg">
          <thead>
            <tr className="bg-gray-100 text-left text-sm font-semibold">
              <th className="p-3 border border-gray-300">No</th>
              <th className="p-3 border border-gray-300">Mahasiswa</th>
              <th className="p-3 border border-gray-300">Jenis</th>
              <th className="p-3 border border-gray-300">Waktu/Tanggal</th>
              <th className="p-3 border border-gray-300">Location</th>
              <th className="p-3 border border-gray-300">Progress</th>
              <th className="p-3 border border-gray-300">Keterangan</th>
              <th className="p-3 border border-gray-300">Status</th>
              <th className="p-3 border border-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {jadwal.map((item, index) => (
              <tr key={item.id} className="hover:bg-gray-50 transition duration-300 text-sm">
                <td className="p-3 border border-gray-200">{index + 1}</td>
                <td className="p-3 border border-gray-200">{mahasiswaNames[item.mahasiswaId] || 'Loading...'}</td>
                <td className="p-3 border border-gray-200">{item.jenis}</td>
                <td className="p-3 border border-gray-200">{item.timestamp ? new Date(item.timestamp.seconds * 1000).toLocaleString() : 'N/A'}</td>
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
                  <FaTrash onClick={() => handleDelete(item.id)} className="text-red-500 cursor-pointer hover:text-red-700 transition duration-300" />
                  <FaEdit onClick={() => handleOpenEditModal(item.id || '')} className="text-blue-500 cursor-pointer hover:text-blue-700 transition duration-300" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default JadwalBimbinganPage;
