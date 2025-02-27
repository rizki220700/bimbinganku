'use client';

import { useState, useEffect } from 'react';
import { collection, doc, getDoc, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebaseconfig';
import Select from 'react-select';

interface ModalEditJadwalBimbinganProps {
  isOpen: boolean;
  onClose: () => void;
  jadwalId: string;
}

interface Mahasiswa {
  value: string;
  label: string;
}

interface Progress {
  bab1: boolean;
  bab2: boolean;
  bab3: boolean;
  bab4: boolean;
  bab5: boolean;
}

const ModalEditJadwalBimbingan = ({ isOpen, onClose, jadwalId }: ModalEditJadwalBimbinganProps) => {
  const [jadwal, setJadwal] = useState<any>(null);
  const [mahasiswaList, setMahasiswaList] = useState<Mahasiswa[]>([]);
  const [selectedMahasiswa, setSelectedMahasiswa] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [selectedJenis, setSelectedJenis] = useState<string>('online');
  const [progress, setProgress] = useState<Progress>({
    bab1: false,
    bab2: false,
    bab3: false,
    bab4: false,
    bab5: false,
  });
  const [keterangan, setKeterangan] = useState<string>('');

  useEffect(() => {
    if (isOpen && jadwalId) {
      const fetchJadwal = async () => {
        try {
          const jadwalDoc = await getDoc(doc(db, 'jadwal-bimbingan', jadwalId));
          if (jadwalDoc.exists()) {
            const data = jadwalDoc.data();
            setJadwal(data);
            setSelectedMahasiswa(data.mahasiswaId);
            setSelectedTime(data.time);
            setSelectedLocation(data.location);
            setSelectedJenis(data.jenis);
            setProgress(data.progress);
            setKeterangan(data.keterangan);
          } else {
            alert('Jadwal tidak ditemukan');
          }
        } catch (error) {
          console.error('Error fetching jadwal:', error);
          alert('Terjadi kesalahan saat memuat jadwal.');
        }
      };

      fetchJadwal();
    }
  }, [isOpen, jadwalId]);

  useEffect(() => {
    const fetchMahasiswa = async () => {
      try {
        const mahasiswaSnapshot = await getDocs(collection(db, 'users'));
        const mahasiswaList = mahasiswaSnapshot.docs.map(doc => ({
          value: doc.id,
          label: doc.data().name,
        }));
        setMahasiswaList(mahasiswaList);
      } catch (error) {
        console.error('Error fetching mahasiswa:', error);
        alert('Terjadi kesalahan saat memuat daftar mahasiswa.');
      }
    };

    fetchMahasiswa();
  }, []);

  const handleProgressChange = (bab: keyof Progress) => {
    setProgress(prev => ({
      ...prev,
      [bab]: !prev[bab],
    }));
  };

  const handleSaveJadwal = async () => {
    if (!selectedMahasiswa || !selectedTime || !selectedLocation) {
      alert('Mohon lengkapi semua data!');
      return;
    }

    try {
      const jadwalRef = doc(db, 'jadwal-bimbingan', jadwalId);
      await updateDoc(jadwalRef, {
        mahasiswaId: selectedMahasiswa,
        time: selectedTime,
        location: selectedLocation,
        jenis: selectedJenis,
        progress: progress,
        keterangan: keterangan,
      });

      alert('Jadwal Bimbingan berhasil diperbarui!');
      onClose(); // Menutup modal setelah berhasil mengupdate jadwal
    } catch (error) {
      console.error('Error updating jadwal:', error);
      alert('Terjadi kesalahan saat mengupdate jadwal.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-semibold">Edit Jadwal Bimbingan</h2>

        {/* Pilih Mahasiswa */}
        <div className="mt-4">
          <label className="block text-sm font-medium">Pilih Mahasiswa</label>
          <Select
            options={mahasiswaList}
            onChange={(selectedOption) => setSelectedMahasiswa(selectedOption?.value || '')}
            value={mahasiswaList.find((m) => m.value === selectedMahasiswa)}
            placeholder="Pilih Mahasiswa"
            isClearable
          />
        </div>

        {/* Waktu Bimbingan */}
        <div className="mt-4">
          <label className="block text-sm font-medium">Pilih Waktu Bimbingan</label>
          <input
            type="datetime-local"
            value={selectedTime}
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
          >
            Simpan Jadwal
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalEditJadwalBimbingan;
