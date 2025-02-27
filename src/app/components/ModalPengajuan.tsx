import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/firebase/firebaseconfig';
import Select from 'react-select';

interface ModalPengajuanProps {
  isOpen: boolean;
  onClose: () => void;
}

const ModalPengajuan = ({ isOpen, onClose }: ModalPengajuanProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [selectedDosen, setSelectedDosen] = useState<string>('');
  const [pesan, setPesan] = useState<string>('');
  const [dosenList, setDosenList] = useState<any[]>([]);

  useEffect(() => {
    const fetchDosen = async () => {
      const q = query(collection(db, 'users'), where('role', '==', 'dosen'));
      const querySnapshot = await getDocs(q);
      const dosenData = querySnapshot.docs.map(doc => ({
        value: doc.id,
        label: doc.data().name,
      }));
      setDosenList(dosenData);
    };
    fetchDosen();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  // upload firebase 
  // const handleUploadToFirebase = async () => {
  //   if (!file || !selectedDosen) {
  //     alert('Mohon lengkapi data terlebih dahulu!');
  //     return;
  //   }
  //   setIsUploading(true);
  
  //   try {
  //     const storageRef = ref(storage, `bimbingan/${selectedDosen}/${file.name}`);
  //     await uploadBytes(storageRef, file);
  //     const fileURL = await getDownloadURL(storageRef);
  
  //     // Mengambil userId mahasiswa dari localStorage
  //     const storedProfile = localStorage.getItem('userProfile');
  //     const userProfile = storedProfile ? JSON.parse(storedProfile) : null;
  //     const userId = userProfile?.userId; // Mengganti mahasiswaId dengan userId

  //     if (!userId) {
  //       alert('Gagal mendapatkan data mahasiswa.');
  //       return;
  //     }
  
  //     // Menambahkan data pengajuan termasuk UUID user
  //     await addDoc(collection(db, 'pengajuan-bimbingan'), {
  //       dosen: selectedDosen,
  //       userId: userId, // Menyimpan UUID user
  //       pesan: pesan,
  //       fileURL: fileURL,
  //       status: 'pending',
  //       timestamp: new Date(),
  //     });
  
  //     alert('Pengajuan berhasil dikirim!');
  //     onClose(); 
  //   } catch (error) {
  //     console.error('Error during file upload:', error);
  //     alert('Terjadi kesalahan saat mengunggah file.');
  //   } finally {
  //     setIsUploading(false);
  //   }
  // };

  const handleUploadToCloudinary = async () => {
    if (!file || !selectedDosen) {
      alert('Mohon lengkapi data terlebih dahulu!');
      return;
    }
    setIsUploading(true);
  
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'upload_file'); // Ganti dengan preset Cloudinary Anda

      // Kirim file ke Cloudinary
      const response = await fetch('https://api.cloudinary.com/v1_1/dtswoxdm7/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.secure_url) {
        const fileURL = data.secure_url;

        // Mengambil userId mahasiswa dari localStorage
        const storedProfile = localStorage.getItem('userProfile');
        const userProfile = storedProfile ? JSON.parse(storedProfile) : null;
        const userId = userProfile?.userId;

        if (!userId) {
          alert('Gagal mendapatkan data mahasiswa.');
          return;
        }

        // Menambahkan data pengajuan termasuk UUID user
        await addDoc(collection(db, 'pengajuan-bimbingan'), {
          dosen: selectedDosen,
          userId: userId, // Menyimpan UUID user
          pesan: pesan,
          fileURL: fileURL,
          status: 'pending',
          timestamp: new Date(),
        });

        alert('Pengajuan berhasil dikirim!');
        onClose(); 
      } else {
        alert('Terjadi kesalahan saat meng-upload file.');
      }
    } catch (error) {
      console.error('Error during file upload:', error);
      alert('Terjadi kesalahan saat mengunggah file.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-xl font-semibold">Pengajuan Bimbingan</h2>

        <div className="mt-4">
          <label className="block text-sm font-medium">Pilih Dosen Pembimbing</label>
          <Select
            options={dosenList}
            onChange={(selectedOption) => setSelectedDosen(selectedOption?.value || '')}
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium">Pesan untuk Dosen</label>
          <textarea
            value={pesan}
            onChange={(e) => setPesan(e.target.value)}
            className="mt-2 w-full p-2 border border-gray-300 rounded-md"
            placeholder="Tuliskan pesan Anda"
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium">Unggah File Pengajuan</label>
          <input type="file" onChange={handleFileChange} className="mt-2 w-full p-2 border border-gray-300 rounded-md" />
        </div>

        <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-gray-500 text-white rounded-lg mr-2">
            Batal
          </button>
          <button
            onClick={handleUploadToCloudinary}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            disabled={isUploading}
          >
            {isUploading ? 'Mengunggah...' : 'Ajukan Bimbingan'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalPengajuan;
