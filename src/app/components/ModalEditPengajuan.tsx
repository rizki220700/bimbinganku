'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/firebaseconfig';
import Select from 'react-select';

interface Pengajuan {
  id: string;
  dosen: string;
  fileURL: string;
  pesan: string;
  status: string;
  timestamp: string;
  userId: string;
}

interface Mahasiswa {
  value: string;
  label: string;
}

interface ModalEditPengajuanProps {
  pengajuan: Pengajuan | null;
  closeModal: () => void;
  updatePengajuan: (updatedPengajuan: Pengajuan) => void;
}

const ModalEditPengajuan: React.FC<ModalEditPengajuanProps> = ({
  pengajuan,
  closeModal,
  updatePengajuan,
}) => {
  const [formData, setFormData] = useState<Pengajuan>({
    id: '',
    dosen: '',
    fileURL: '',
    pesan: '',
    status: '',
    timestamp: '',
    userId: '',
  });
  const [mahasiswaList, setMahasiswaList] = useState<Mahasiswa[]>([]);
  const [dosenList, setDosenList] = useState<Mahasiswa[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (pengajuan) {
      setFormData({ ...pengajuan });
    } else {
      setFormData({
        id: '',
        dosen: '',
        fileURL: '',
        pesan: '',
        status: '',
        timestamp: '',
        userId: '',
      });
    }
  }, [pengajuan]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      try {
        // Mengambil data dari koleksi 'users' dan memisahkannya berdasarkan role
        const userSnapshot = await getDocs(collection(db, 'users'));
        const mahasiswaData: Mahasiswa[] = [];
        const dosenData: Mahasiswa[] = [];

        userSnapshot.docs.forEach((doc) => {
          const user = doc.data();
          if (user.role === 'mahasiswa') {
            mahasiswaData.push({
              value: doc.id,
              label: user.name || 'Nama tidak tersedia',
            });
          } else if (user.role === 'dosen') {
            dosenData.push({
              value: doc.id,
              label: user.name || 'Nama tidak tersedia',
            });
          }
        });

        setMahasiswaList(mahasiswaData);
        setDosenList(dosenData);

        console.log('Mahasiswa List:', mahasiswaData);
        console.log('Dosen List:', dosenData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSelectChange = (selectedOption: any, field: keyof Pengajuan) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: selectedOption ? selectedOption.value : '',
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = () => {
    if (!formData.dosen || !formData.pesan || !formData.status || !formData.userId) {
      alert('Harap isi semua data.');
      return;
    }

    updatePengajuan(formData);
    closeModal();
  };

  if (isLoading) {
    return (
      <div className="modal fixed inset-0 flex items-center justify-center bg-gray-700 bg-opacity-50 z-50">
        <div className="modal-content bg-white p-6 rounded-lg w-96 shadow-lg">
          <h2 className="text-2xl font-bold mb-4">Memuat Data...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="modal fixed inset-0 flex items-center justify-center bg-gray-700 bg-opacity-50 z-50">
      <div className="modal-content bg-white p-6 rounded-lg w-96 shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Edit Pengajuan Bimbingan</h2>

        {/* Input Mahasiswa */}
        <label className="block mb-2">Mahasiswa</label>
        <Select
          options={mahasiswaList}
          value={mahasiswaList.find((m) => m.value === formData.userId)}
          onChange={(option) => handleSelectChange(option, 'userId')}
          placeholder="Pilih Mahasiswa"
          isClearable
          className="mb-4"
        />

        {/* Input Dosen */}
        <label className="block mb-2">Dosen</label>
        <Select
          options={dosenList}
          value={dosenList.find((d) => d.value === formData.dosen)}
          onChange={(option) => handleSelectChange(option, 'dosen')}
          placeholder="Pilih Dosen"
          isClearable
          className="mb-4"
        />

        {/* Input Pesan */}
        <label className="block mb-2">Pesan</label>
        <input
          type="text"
          name="pesan"
          value={formData.pesan}
          onChange={handleInputChange}
          className="w-full border p-2 mb-4"
        />

        {/* Input Status */}
        <label className="block mb-2">Status</label>
        <Select
          options={[
            { value: 'pending', label: 'Pending' },
            { value: 'approved', label: 'Approved' },
            { value: 'rejected', label: 'Rejected' },
          ]}
          value={
            formData.status
              ? { value: formData.status, label: formData.status.charAt(0).toUpperCase() + formData.status.slice(1) }
              : null
          }
          onChange={(option) => handleSelectChange(option, 'status')}
          placeholder="Pilih Status"
          isClearable
          className="mb-4"
        />

        {/* Button Simpan dan Tutup */}
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white py-2 px-4 rounded mr-2"
          >
            Simpan
          </button>
          <button
            onClick={closeModal}
            className="bg-gray-500 text-white py-2 px-4 rounded"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalEditPengajuan;
