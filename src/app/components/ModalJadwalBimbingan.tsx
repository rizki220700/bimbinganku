'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, getDoc, doc } from 'firebase/firestore';
import { db } from '@/firebase/firebaseconfig';
import Select from 'react-select';

interface ModalJadwalBimbinganProps {
  isOpen: boolean;
  onClose: () => void;
  dosenId: string;
}

const ModalJadwalBimbingan = ({ isOpen, onClose, dosenId }: ModalJadwalBimbinganProps) => {
  const [mahasiswaList, setMahasiswaList] = useState<any[]>([]);
  const [selectedMahasiswa, setSelectedMahasiswa] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedJenis, setSelectedJenis] = useState<string>('online');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Progress bab1, bab2, bab3, bab4, bab5
  const [progress, setProgress] = useState<Record<'bab1' | 'bab2' | 'bab3' | 'bab4' | 'bab5', boolean>>({
    bab1: false,
    bab2: false,
    bab3: false,
    bab4: false,
    bab5: false,
  });
  
  // Pesan/Keterangan
  const [keterangan, setKeterangan] = useState<string>('');

  // Ambil daftar mahasiswa yang sudah mengajukan bimbingan ke dosen
  useEffect(() => {
    const fetchMahasiswa = async () => {
      const q = query(collection(db, 'pengajuan-bimbingan'), where('dosen', '==', dosenId));
  
      const querySnapshot = await getDocs(q);
  
      if (querySnapshot.empty) {
        console.log("Tidak ada pengajuan bimbingan yang ditemukan untuk dosenId:", dosenId);
      } else {
        console.log("Pengajuan bimbingan ditemukan:", querySnapshot.docs);
      }
  
      // Gunakan Set untuk menghindari mahasiswa yang sama muncul lebih dari sekali
      const mahasiswaData = await Promise.all(
        querySnapshot.docs.map(async (docSnapshot) => {
          const mahasiswaId = docSnapshot.data().userId;
  
          const mahasiswaDoc = await getDoc(doc(db, 'users', mahasiswaId));
          if (mahasiswaDoc.exists()) {
            return {
              value: mahasiswaId,
              label: mahasiswaDoc.data().name, // Mengambil nama dari koleksi 'users'
            };
          }
          return null;
        })
      );
  
      // Hapus data null dan filter duplikat berdasarkan mahasiswaId
      const uniqueMahasiswaData = Array.from(
        new Map(
          mahasiswaData
            .filter(item => item !== null)
            .map(item => [item.value, item]) // Key adalah mahasiswaId (value) untuk menghindari duplikasi
        ).values()
      );
  
      setMahasiswaList(uniqueMahasiswaData);
    };
  
    if (isOpen) {
      fetchMahasiswa();
    }
  }, [isOpen, dosenId]);
  

  // Handle perubahan pada checkbox progress bab1 - bab5
  const handleProgressChange = (bab: 'bab1' | 'bab2' | 'bab3' | 'bab4' | 'bab5') => {
    setProgress(prev => ({
      ...prev,
      [bab]: !prev[bab] // Toggle nilai progress untuk bab yang dipilih
    }));
  };
  

  // Simpan jadwal bimbingan

  const handleSaveJadwal = async () => {
    if (!selectedMahasiswa || !selectedTime || !selectedLocation) {
      alert('Mohon lengkapi semua data!');
      return;
    }
  
    setIsSaving(true);
  
    try {
      await addDoc(collection(db, 'jadwal-bimbingan'), {
        dosenId: dosenId,
        mahasiswaId: selectedMahasiswa,
        time: selectedTime,
        location: selectedLocation,
        jenis: selectedJenis,
        status: 'scheduled',
        timestamp: new Date(),
        progress: progress,  // Menambahkan progress bab1-bab5
        keterangan: keterangan,  // Menambahkan keterangan
      });
  
      alert('Jadwal Bimbingan berhasil dibuat!');
      
      // Reset semua state form setelah jadwal berhasil disimpan
      setSelectedMahasiswa('');
      setSelectedTime('');
      setSelectedLocation('');
      setSelectedJenis('online');
      setProgress({
        bab1: false,
        bab2: false,
        bab3: false,
        bab4: false,
        bab5: false,
      });
      setKeterangan('');
  
      onClose(); // Menutup modal setelah reset form
    } catch (error) {
      console.error('Error saving jadwal:', error);
      alert('Terjadi kesalahan saat menyimpan jadwal.');
    } finally {
      setIsSaving(false);
    }
  };
  

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-semibold">Buat Jadwal Bimbingan</h2>

        {/* Pilih Mahasiswa */}
        <div className="mt-4">
          <label className="block text-sm font-medium">Pilih Mahasiswa</label>
          <Select
            options={mahasiswaList}
            onChange={(selectedOption) => setSelectedMahasiswa(selectedOption?.value || '')}
            placeholder="Pilih Mahasiswa"
            isClearable
          />
        </div>

        {/* Waktu Bimbingan */}
        <div className="mt-4">
          <label className="block text-sm font-medium">Pilih Waktu Bimbingan</label>
          <input
            type="datetime-local"
            onChange={(e) => setSelectedTime(e.target.value)}
            className="mt-2 w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        {/* Lokasi Bimbingan */}
        <div className="mt-4">
          <label className="block text-sm font-medium">Pilih Lokasi Bimbingan</label>
          <input
            type="text"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="mt-2 w-full p-2 border border-gray-300 rounded-md"
            placeholder="Masukkan lokasi bimbingan"
          />
        </div>

        {/* Jenis Bimbingan */}
        <div className="mt-4">
          <label className="block text-sm font-medium">Pilih Jenis Bimbingan</label>
          <Select
            options={[
              { value: 'online', label: 'Online' },
              { value: 'offline', label: 'Offline' },
            ]}
            onChange={(selectedOption) => setSelectedJenis(selectedOption?.value || 'online')}
            value={{ value: selectedJenis, label: selectedJenis === 'online' ? 'Online' : 'Offline' }}
          />
        </div>

        {/* Checklist Bab */}
        <div className="mt-4">
          <label className="block text-sm font-medium">Progress Bab</label>
          <div className="flex flex-wrap space-x-4 mt-2">
            {(['bab1', 'bab2', 'bab3', 'bab4', 'bab5'] as const).map((bab) => (
              <div key={bab} className="flex items-center mb-2">
                <input
                  type="checkbox"
                  checked={progress[bab]}
                  onChange={() => handleProgressChange(bab)}
                  className="mr-2"
                />
                <label>{bab.toUpperCase()}</label>
              </div>
            ))}
          </div>
        </div>




        {/* Keterangan */}
        <div className="mt-4">
          <label className="block text-sm font-medium">Pesan/Keterangan</label>
          <textarea
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            className="mt-2 w-full p-2 border border-gray-300 rounded-md"
            placeholder="Masukkan pesan atau keterangan"
          />
        </div>

        {/* Button Save / Cancel */}
        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-gray-500 text-white rounded-lg mr-2">
            Batal
          </button>
          <button
            onClick={handleSaveJadwal}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            disabled={isSaving}
          >
            {isSaving ? 'Menyimpan...' : 'Simpan Jadwal'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalJadwalBimbingan;
