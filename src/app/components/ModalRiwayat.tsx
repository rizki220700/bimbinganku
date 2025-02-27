'use client';

import { useState, useEffect } from 'react';
import { db } from '@/firebase/firebaseconfig';
import { collection, getDocs, query, where, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';

interface RiwayatBimbingan {
  id: string;
  tanggal: string;
  dosen: string;
  status: string;
  keterangan: string;
  fileURL?: string;
}

interface ModalRiwayatProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const ModalRiwayat: React.FC<ModalRiwayatProps> = ({ isOpen, onClose, userId }) => {
  const [riwayat, setRiwayat] = useState<RiwayatBimbingan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRiwayat = async () => {
      if (!userId) {
        console.warn('User ID tidak tersedia');
        return;
      }
      setLoading(true);
      try {
        const q = query(collection(db, 'pengajuan-bimbingan'), where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        console.log(`Fetched ${querySnapshot.size} riwayat untuk userId: ${userId}`);

        const fetchedRiwayat = await Promise.all(querySnapshot.docs.map(async (docSnapshot) => {
          const data = docSnapshot.data();
          const dosenId = data.dosen;
          console.log('Dosen ID:', dosenId); // Log untuk memastikan UID dosen

          // Mencari nama dosen di koleksi 'users' dengan UID menggunakan getDoc
          const dosenDocRef = doc(db, 'users', dosenId); // Menggunakan dosenId sebagai ID dokumen
          const dosenDoc = await getDoc(dosenDocRef);

          console.log('Dosen Query Result:', dosenDoc.exists() ? dosenDoc.data() : 'Dosen tidak ditemukan');

          // Periksa apakah dokumen dosen ada dan ambil nama dosen
          const dosenName = dosenDoc.exists() ? dosenDoc.data()?.name : 'Dosen Tidak Ditemukan';

          return {
            id: docSnapshot.id,
            tanggal: format((data.timestamp as Timestamp).toDate(), 'dd/MM/yyyy HH:mm:ss'),
            dosen: dosenName,
            status: data.status,
            keterangan: data.pesan || 'Tidak ada keterangan',
            fileURL: data.fileURL,
          };
        }));

        if (fetchedRiwayat.length === 0) {
          console.log('Tidak ada riwayat ditemukan untuk userId:', userId);
        }

        setRiwayat(fetchedRiwayat);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchRiwayat();
    } else {
      setRiwayat([]); // Reset data saat modal ditutup
    }
  }, [isOpen, userId]);

  const handleCancelPengajuan = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'pengajuan-bimbingan', id)); // Menghapus pengajuan dari koleksi pengajuan-bimbingan
      setRiwayat(riwayat.filter(item => item.id !== id)); // Update state setelah dihapus
      alert('Pengajuan berhasil dibatalkan.');
    } catch (error) {
      console.error('Error canceling pengajuan:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4">Riwayat Pengajuan Bimbingan</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <ul className="space-y-4 max-h-80 overflow-y-auto">
            {riwayat.length > 0 ? (
              riwayat.map((item) => (
                <li key={item.id} className="p-4 bg-gray-100 rounded-lg shadow">
                  <p><strong>Tanggal Pengajuan:</strong> {item.tanggal}</p>
                  <p><strong>Dosen Pembimbing:</strong> {item.dosen}</p>
                  <p><strong>Status Pengajuan:</strong> {item.status}</p>
                  <p><strong>Keterangan:</strong> {item.keterangan || 'Tidak ada keterangan'}</p>
                  {item.fileURL && (
                    <p><strong>File Pengajuan:</strong>
                      <a href={item.fileURL} target="_blank" className="text-blue-600">Lihat File</a>
                    </p>
                  )}
                  {item.status === 'pending' || item.status === 'rejected' ? (
                    <button
                      onClick={() => handleCancelPengajuan(item.id)}
                      className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700"
                    >
                      Batalkan Pengajuan
                    </button>
                  ) : null}
                </li>
              ))
            ) : (
              <p>Tidak ada riwayat ditemukan.</p>
            )}
          </ul>
        )}
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-700"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalRiwayat;
