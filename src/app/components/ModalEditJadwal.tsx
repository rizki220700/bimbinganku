'use client';

import { useState, useEffect } from 'react';
import { db } from '@/firebase/firebaseconfig';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { FaTimes } from 'react-icons/fa';
import Select from 'react-select';

interface ModalEditJadwalProps {
  isOpen: boolean;
  onClose: () => void;
  jadwalId?: string; // Optional untuk menambahkan jadwal baru
  dosenList: { [key: string]: string };
  mahasiswaList: { [key: string]: string }; // List mahasiswa for select input
}

const ModalEditJadwal = ({ isOpen, onClose, jadwalId, dosenList, mahasiswaList }: ModalEditJadwalProps) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedDosen, setSelectedDosen] = useState<string>('');
  const [selectedMahasiswa, setSelectedMahasiswa] = useState<string>('');
  const [jenis, setJenis] = useState<string>('online');
  const [location, setLocation] = useState<string>('');
  const [keterangan, setKeterangan] = useState<string>('');
  const [progress, setProgress] = useState<{ bab1: boolean; bab2: boolean; bab3: boolean; bab4: boolean; bab5: boolean }>({
    bab1: false,
    bab2: false,
    bab3: false,
    bab4: false,
    bab5: false,
  });
  const [status, setStatus] = useState<'scheduled' | 'ended' | 'expired'>('scheduled'); // Status jadwal

  useEffect(() => {
    if (jadwalId) {
      const fetchJadwal = async () => {
        setLoading(true);
        const jadwalDoc = await getDoc(doc(db, 'jadwal-bimbingan', jadwalId));
        if (jadwalDoc.exists()) {
          const data = jadwalDoc.data();
          setSelectedDosen(data.dosenId);
          setSelectedMahasiswa(data.mahasiswaId); // Set mahasiswa
          setJenis(data.jenis);
          setLocation(data.location);
          setKeterangan(data.keterangan);
          setProgress(data.progress);
          setStatus(data.status); // Set status
        }
        setLoading(false);
      };
      fetchJadwal();
    }
  }, [jadwalId]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const jadwalData = {
        dosenId: selectedDosen,
        mahasiswaId: selectedMahasiswa, // Include mahasiswa
        jenis,
        location,
        keterangan,
        progress,
        status, // Include status
      };

      if (jadwalId) {
        // Update jadwal yang ada
        await updateDoc(doc(db, 'jadwal-bimbingan', jadwalId), jadwalData);
      } else {
        // Tambahkan jadwal baru
        const newJadwalId = new Date().toISOString(); // Menggunakan timestamp sebagai ID
        await setDoc(doc(db, 'jadwal-bimbingan', newJadwalId), jadwalData);
      }

      onClose(); // Tutup modal setelah berhasil menyimpan
    } catch (error) {
      console.error('Error saving jadwal:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    // Reset state jika modal ditutup
    setSelectedDosen('');
    setSelectedMahasiswa('');
    setJenis('online');
    setLocation('');
    setKeterangan('');
    setProgress({
      bab1: false,
      bab2: false,
      bab3: false,
      bab4: false,
      bab5: false,
    });
    setStatus('scheduled'); // Reset status ke scheduled
  };

  if (!isOpen) return null;

  const mahasiswaOptions = Object.entries(mahasiswaList).map(([mahasiswaId, mahasiswaName]) => ({
    value: mahasiswaId,
    label: mahasiswaName,
  }));

  const statusOptions = [
    { value: 'scheduled', label: 'Scheduled' },
    { value: 'ended', label: 'Ended' },
    { value: 'expired', label: 'Expired' },
  ];

  return (
    <div
      className="fixed inset-0 flex justify-center items-center bg-gray-600 bg-opacity-50 z-50"
      onClick={(e) => {
        // Menutup modal jika pengguna mengklik area latar belakang
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className="bg-white p-6 rounded-lg w-96 relative">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">{jadwalId ? 'Edit' : 'Tambah'} Jadwal Bimbingan</h2>
          <FaTimes
            onClick={handleClose}
            className="cursor-pointer text-gray-500 hover:text-gray-700"
          />
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <form className="space-y-4">
            <div>
              <label htmlFor="dosen" className="block text-sm font-medium">Dosen Pembimbing</label>
              <select
                id="dosen"
                value={selectedDosen}
                onChange={(e) => setSelectedDosen(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="">Pilih Dosen</option>
                {Object.entries(dosenList).map(([dosenId, dosenName]) => (
                  <option key={dosenId} value={dosenId}>
                    {dosenName}
                  </option>
                ))}
              </select>
            </div>

            {/* React-Select for Mahasiswa */}
            <div>
              <label htmlFor="mahasiswa" className="block text-sm font-medium">Mahasiswa</label>
              <Select
                id="mahasiswa"
                value={mahasiswaOptions.find((option) => option.value === selectedMahasiswa) || null}
                onChange={(selectedOption) => setSelectedMahasiswa(selectedOption?.value || '')}
                options={mahasiswaOptions}
                placeholder="Pilih Mahasiswa"
              />
            </div>

            <div>
              <label htmlFor="jenis" className="block text-sm font-medium">Jenis Bimbingan</label>
              <select
                id="jenis"
                value={jenis}
                onChange={(e) => setJenis(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium">Lokasi</label>
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label htmlFor="keterangan" className="block text-sm font-medium">Keterangan</label>
              <textarea
                id="keterangan"
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
                rows={3}
              />
            </div>

            <div>
  <label className="block text-sm font-medium">Progress Skripsi</label>
  <div className="flex space-x-4 mt-2">
    {['bab1', 'bab2', 'bab3', 'bab4', 'bab5'].map((bab) => (
      <div key={bab} className="flex items-center">
        <input
          type="checkbox"
          checked={progress[bab as keyof typeof progress]}
          onChange={() =>
            setProgress((prev) => ({ ...prev, [bab]: !prev[bab as keyof typeof progress] }))
          }
          id={bab}
          className="mr-2"
        />
        <label htmlFor={bab} className="text-sm">{bab.toUpperCase()}</label>
      </div>
    ))}
  </div>
</div>


            {/* Status */}
            <div>
              <label className="block text-sm font-medium">Status</label>
              <Select
                value={statusOptions.find((option) => option.value === status) || null}
                onChange={(selectedOption) => setStatus(selectedOption?.value as 'scheduled' | 'ended' | 'expired')}
                options={statusOptions}
                placeholder="Pilih Status"
              />
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Simpan
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ModalEditJadwal;
