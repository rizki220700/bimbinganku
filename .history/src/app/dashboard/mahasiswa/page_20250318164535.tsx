'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAuth } from 'firebase/auth';
import { db } from '@/firebase/firebaseconfig';
import { doc, getDoc, updateDoc, collection, getDocs, query, where, deleteDoc } from 'firebase/firestore';
import ProgressSkripsi from '@/app/components/ProgressBar';
import ModalPengajuan from '@/app/components/ModalPengajuan';
import ModalRiwayat from '@/app/components/ModalRiwayat';
import ModalEditProfile from '@/app/components/ModalEditProfile';  // Import komponen modal edit profil
import AuthWrapper from '@/app/components/AuthWrapper';


interface UserProfile {
  name: string;
  email: string;
  nim: string;
  photoURL: string | null;
  userId: string;
}

const DashboardMahasiswa: React.FC = () => {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isRiwayatModalOpen, setIsRiwayatModalOpen] = useState<boolean>(false); // State untuk Modal Riwayat
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState<boolean>(false); // Modal Edit Profil
  const [dosenName, setDosenName] = useState<string>(''); //dosen pembimbing

  const [jadwalBimbingan, setJadwalBimbingan] = useState<any[]>([]);
  const [loadingJadwal, setLoadingJadwal] = useState<boolean>(true);

  const [pengajuanCount, setPengajuanCount] = useState<number>(0); // State untuk menyimpan jumlah pengajuan

const fetchPengajuanCount = async () => {
  if (userProfile?.userId) {
    try {
      const q = query(collection(db, 'pengajuan-bimbingan'), where('userId', '==', userProfile.userId));
      const querySnapshot = await getDocs(q);
      setPengajuanCount(querySnapshot.size); // Mengatur jumlah pengajuan berdasarkan jumlah dokumen yang ditemukan
    } catch (error) {
      console.error('Error fetching pengajuan count:', error);
    }
  }
};

useEffect(() => {
  if (userProfile?.userId) {
    fetchPengajuanCount();
  }
}, [userProfile?.userId]);


  useEffect(() => {
    const storedUserProfile = localStorage.getItem('userProfile');
    if (storedUserProfile) {
      setUserProfile(JSON.parse(storedUserProfile));
      setLoading(false);
    } else {
      const fetchUserData = async () => {
        const auth = getAuth();
        const user = auth.currentUser;

        if (user) {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const userData = docSnap.data();
            setUserProfile({
              name: userData.name,
              email: userData.email,
              nim: userData.nim,
              photoURL: userData.photoURL || null,
              userId: user.uid,
            });

            localStorage.setItem('userProfile', JSON.stringify({
              name: userData.name,
              email: userData.email,
              nim: userData.nim,
              photoURL: userData.photoURL || null,
              userId: user.uid,
            }));
          } else {
            console.error('User data not found');
          }
        }
        setLoading(false);
      };
      fetchUserData();
    }


      const fetchDosen = async () => {
        if (userProfile?.userId) {
          try {
            // Cari pengajuan bimbingan berdasarkan userId
            const q = query(collection(db, 'pengajuan-bimbingan'), where('userId', '==', userProfile.userId));
            const querySnapshot = await getDocs(q);
    
            if (!querySnapshot.empty) {
              // Ambil pengajuan bimbingan pertama yang ditemukan
              const pengajuanData = querySnapshot.docs[0].data();
              const dosenId = pengajuanData.dosen; // Dosen adalah ID dari dokumen di koleksi 'users'
    
              // Ambil data dosen menggunakan dosenId
              const dosenDocRef = doc(db, 'users', dosenId);
              const dosenDoc = await getDoc(dosenDocRef);
    
              if (dosenDoc.exists()) {
                const dosenData = dosenDoc.data();
                setDosenName(dosenData?.name || 'Dosen Tidak Ditemukan');
              } else {
                console.log('Dosen tidak ditemukan');
              }
            } else {
              console.log('Tidak ada pengajuan bimbingan ditemukan untuk mahasiswa ini');
            }
          } catch (error) {
            console.error('Error fetching dosen data:', error);
          }
        }
      };
    
      fetchDosen();

      const fetchJadwalBimbingan = async () => {
        if (!userProfile?.userId) return;
    
        setLoadingJadwal(true);
        try {
            const q = query(
                collection(db, 'jadwal-bimbingan'),
                where('mahasiswaId', '==', userProfile.userId)  // Menggunakan mahasiswaId
            );
            const querySnapshot = await getDocs(q);
            
            const jadwalData = querySnapshot.docs.map(doc => doc.data());
            setJadwalBimbingan(jadwalData);
        } catch (error) {
            console.error('Error fetching jadwal bimbingan:', error);
        } finally {
            setLoadingJadwal(false);
        }
    };
    
    // Memastikan dipanggil saat userProfile siap
    if (userProfile?.userId) {
        fetchJadwalBimbingan();
    }
    
    }, [userProfile?.userId]); // Jalankan jika userProfile berubah
    

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleOpenRiwayatModal = () => {
    setIsRiwayatModalOpen(true);  // Buka Modal Riwayat
  };

  const handleCloseRiwayatModal = () => {
    setIsRiwayatModalOpen(false); // Tutup Modal Riwayat
  };

  const handleOpenEditProfileModal = () => {
    setIsEditProfileModalOpen(true); // Buka Modal Edit Profil
  };

  const handleCloseEditProfileModal = () => {
    setIsEditProfileModalOpen(false); // Tutup Modal Edit Profil
  };


  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-lg font-semibold">Loading...</div>;
  }

  return (

    <AuthWrapper allowedRoles={['mahasiswa']}>
    <div className="p-4 sm:p-8 space-y-8 bg-gray-50 min-h-screen">
      <header className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 sm:p-6 rounded-lg shadow-md">
        <h1 className="text-2xl sm:text-3xl font-bold">Dashboard Mahasiswa</h1>
      </header>

      {/* Profil Mahasiswa */}
      <section className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
        <div className="flex items-center space-x-4">
          <img 
            src={userProfile?.photoURL || '/default-profile.png'} 
            alt="Profile Picture" 
            className="w-16 h-16 rounded-full object-cover" 
          />
          <div>
            <p className="text-lg font-medium">{userProfile?.name}</p>
            <p className="text-sm text-gray-500">{userProfile?.nim}</p>
            <p className="text-sm text-gray-500">{userProfile?.email}</p>
          </div>
          <button
            className="ml-auto px-4 py-2 bg-indigo-600 text-white rounded-lg"
            onClick={handleOpenEditProfileModal} // Buka modal edit profil
          >
            Edit Profil
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-lg sm:text-xl font-semibold mb-4 text-center">DOSEN PEMBIMBING</h2>
          <p className="text-base sm:text-lg text-center">{dosenName || 'Belum ada dosen pembimbing'}</p>
        </div>



        <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md">
  <h2 className="text-lg sm:text-xl font-semibold mb-4 text-center">PENGAJUAN BIMBINGAN</h2>
  <p className="text-base sm:text-lg text-center">
    Jumlah Pengajuan: {pengajuanCount}
  </p>
  <button
    className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg w-full"
    onClick={handleOpenModal}
  >
    Ajukan Bimbingan
  </button>
  <button
    className="px-4 py-2 mt-4 bg-green-600 text-white rounded-lg w-full"
    onClick={handleOpenRiwayatModal}
  >
    Lihat Riwayat Bimbingan
  </button>
</div>


        <ProgressSkripsi userId={userProfile?.userId || ''} />
      </section>

      <section className="bg-white p-6 rounded-lg shadow-md">
  <h2 className="text-xl font-semibold mb-4">Jadwal Bimbingan</h2>
  
  {loading ? (
    <div>Loading jadwal...</div>
  ) : jadwalBimbingan.length === 0 ? (
    <p>Tidak ada jadwal bimbingan.</p>
  ) : (
    <table className="w-full table-auto border-collapse border border-gray-300">
      <thead>
        <tr className="bg-gray-100">
          <th className="px-4 py-2 border">No</th>
          <th className="px-4 py-2 border">Jenis Bimbingan</th>
          <th className="px-4 py-2 border">Tanggal</th>
          <th className="px-4 py-2 border">Tempat</th>
          <th className="px-4 py-2 border">Progress</th>
          <th className="px-4 py-2 border">Keterangan</th>
          <th className="px-4 py-2 border">Status</th>
        </tr>
      </thead>
      <tbody>
  {jadwalBimbingan.map((item, index) => (
    <tr key={item.id || index} className="border-b">
      <td className="px-4 py-2 border">{index + 1}</td>
      <td className="px-4 py-2 border">{item.jenis}</td>
      <td className="px-4 py-2 border">
  {item.timestamp 
    ? new Date(item.timestamp.seconds * 1000).toLocaleString('id-ID', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      }) 
    : 'Tanggal tidak tersedia'}
</td>

      <td className="px-4 py-2 border">{item.location}</td>
      <td className="px-4 py-2 border">
        {Object.entries(item.progress)
          .filter(([_, status]) => status)
          .map(([bab]) => bab)
          .join(', ')}
      </td>
      <td className="px-4 py-2 border">{item.keterangan}</td>
      <td className="px-4 py-2 border">{item.status}</td>
    </tr>
  ))}
</tbody>

    </table>
  )}
</section>


      {/* Tombol untuk membuka Modal Riwayat */}
     

      {/* ModalRiwayat */}
      <ModalRiwayat 
        isOpen={isRiwayatModalOpen} 
        onClose={handleCloseRiwayatModal} 
        userId={userProfile?.userId || ''}  // Pastikan userId ada sebelum dikirim
      />

      {/* Modal Edit Profil */}
      <ModalEditProfile 
        isOpen={isEditProfileModalOpen} 
        onClose={handleCloseEditProfileModal} 
        userProfile={userProfile} 
        setUserProfile={setUserProfile} 
      />

      <ModalPengajuan isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
    </AuthWrapper>
  );
};

export default DashboardMahasiswa;