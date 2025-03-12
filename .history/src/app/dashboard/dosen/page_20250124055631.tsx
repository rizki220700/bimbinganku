'use client';

import { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { db } from '@/firebase/firebaseconfig';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import ModalEditProfile from '@/app/components/ModalEditProfile'; 
import CardCollection from '@/app/components/CardCollection'; 
import AuthWrapper from '@/app/components/AuthWrapper';

interface UserProfile {
  name: string;
  email: string;
  nim: string;
  photoURL: string | null;
  userId: string;
}

interface Mahasiswa {
  id: string;
  name: string;
  nim: string;
  email: string;
  photoURL: string | null;
}

const DosenDashboard: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [mahasiswaList, setMahasiswaList] = useState<Mahasiswa[]>([]);
  const [pengajuanCount, setPengajuanCount] = useState<number>(0);
  const [jadwalCount, setJadwalCount] = useState<number>(0);
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState<boolean>(false);

  // Fetch user profile on component mount
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
            const userProfileData = {
              name: userData.name,
              email: userData.email,
              nim: userData.nim,
              photoURL: userData.photoURL || null,
              userId: user.uid,
            };
            setUserProfile(userProfileData);
            localStorage.setItem('userProfile', JSON.stringify(userProfileData));
          }
        }
        setLoading(false);
      };
      fetchUserData();
    }
  }, []);

  // Fetch related data after userProfile is loaded
  useEffect(() => {
    if (userProfile?.userId) {
      const fetchMahasiswaData = async () => {
        try {
          // Query untuk status 'Pending'
          const qPending = query(
            collection(db, 'pengajuan-bimbingan'),
            where('dosen', '==', userProfile.userId),
            where('status', '==', 'Pending')
          );
      
          // Query untuk status 'Accepted'
          const qAccepted = query(
            collection(db, 'pengajuan-bimbingan'),
            where('dosen', '==', userProfile.userId),
            where('status', '==', 'Accepted')
          );
      
          // Ambil data dari kedua query
          const querySnapshotPending = await getDocs(qPending);
          const querySnapshotAccepted = await getDocs(qAccepted);
      
          const mahasiswaData: Mahasiswa[] = [];
          const uniqueUserIds = new Set<string>();
      
          // Proses data dari query 'Pending'
          querySnapshotPending.forEach(doc => {
            const data = doc.data();
            if (!uniqueUserIds.has(data.userId)) {
              uniqueUserIds.add(data.userId);
              mahasiswaData.push({
                id: data.userId,
                name: data.name || 'Nama tidak tersedia',
                nim: data.nim || 'NIM tidak tersedia',
                email: data.email || 'Email tidak tersedia',
                photoURL: data.photoURL || null,
              });
            }
          });
      
          // Proses data dari query 'Accepted'
          querySnapshotAccepted.forEach(doc => {
            const data = doc.data();
            if (!uniqueUserIds.has(data.userId)) {
              uniqueUserIds.add(data.userId);
              mahasiswaData.push({
                id: data.userId,
                name: data.name || 'Nama tidak tersedia',
                nim: data.nim || 'NIM tidak tersedia',
                email: data.email || 'Email tidak tersedia',
                photoURL: data.photoURL || null,
              });
            }
          });
      
          setMahasiswaList(mahasiswaData);
        } catch (error) {
          console.error('Error fetching mahasiswa data:', error);
        }
      };
      

      const fetchPengajuanData = async () => {
        try {
          const q = query(
            collection(db, 'pengajuan-bimbingan'),
            where('dosen', '==', userProfile.userId)
          );

          const querySnapshot = await getDocs(q);
          setPengajuanCount(querySnapshot.size);
        } catch (error) {
          console.error('Error fetching pengajuan data:', error);
        }
      };

      const fetchJadwalData = async () => {
        try {
          const q = query(
            collection(db, 'jadwal-bimbingan'),
            where('dosenId', '==', userProfile.userId)
          );

          const querySnapshot = await getDocs(q);
          setJadwalCount(querySnapshot.size);
        } catch (error) {
          console.error('Error fetching jadwal data:', error);
        }
      };

      fetchMahasiswaData();
      fetchPengajuanData();
      fetchJadwalData();
    }
  }, [userProfile]);

  // Handlers for modal
  const handleOpenEditProfileModal = () => setIsEditProfileModalOpen(true);
  const handleCloseEditProfileModal = () => setIsEditProfileModalOpen(false);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen text-lg font-semibold">Loading...</div>;
  }

  return (
    <AuthWrapper allowedRoles={['dosen']}>
      <div className="p-4 sm:p-8 space-y-8 bg-gray-50 min-h-screen">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 sm:p-6 rounded-lg shadow-md">
          <h1 className="text-2xl sm:text-3xl font-bold">Dashboard Dosen</h1>
        </header>

        {/* Profil Dosen */}
        <section className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Profil Dosen</h2>
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
          </div>
          <button
            className="mt-4 sm:mt-0 px-4 py-2 bg-indigo-600 text-white rounded-lg"
            onClick={handleOpenEditProfileModal}
          >
            Edit Profil
          </button>
        </section>

        {/* Kartu Daftar Mahasiswa, Pengajuan, dan Jadwal Bimbingan */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <CardCollection
            title="Daftar Mahasiswa yang Dibimbing"
            count={mahasiswaList.length}
            category="listMahasiswa"
            route="dosen/listMahasiswa"
          />
          <CardCollection
            title="Pengajuan Bimbingan"
            count={pengajuanCount}
            category="pengajuan"
            route="dosen/pengajuan"
          />
          <CardCollection
            title="Jadwal Bimbingan"
            count={jadwalCount}
            category="jadwal"
            route="dosen/jadwal"
          />
        </section>

        {/* Modal Components */}
        <ModalEditProfile
          isOpen={isEditProfileModalOpen}
          onClose={handleCloseEditProfileModal}
          userProfile={userProfile}
          setUserProfile={setUserProfile}
        />
      </div>
    </AuthWrapper>
  );
};

export default DosenDashboard;
