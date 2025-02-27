'use client';

import { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebaseconfig';
import { getAuth, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import cloudinary from '@/lib/cloudinary';

interface UserProfile {
  name: string;
  email: string;
  nim: string;
  photoURL: string | null;
  userId: string;
}

interface ModalEditProfileProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile | null;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
}

const ModalEditProfile: React.FC<ModalEditProfileProps> = ({
  isOpen,
  onClose,
  userProfile,
  setUserProfile,
}) => {
  const [name, setName] = useState<string>(userProfile?.name || '');
  const [email, setEmail] = useState<string>(userProfile?.email || '');
  const [nim, setNim] = useState<string>(userProfile?.nim || '');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [password, setPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<string>('');

  useEffect(() => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      const parsedData = JSON.parse(userData);
      setRole(parsedData.role || '');
    }
  }, []);


//  cloudinary 
  const handleUploadPhoto = async (): Promise<string | null> => {
    if (!photoFile || !userProfile) return userProfile?.photoURL || null;
  
    const formData = new FormData();
    formData.append('file', photoFile); // Menambahkan file yang akan diupload
    formData.append('upload_preset', 'bimbingan_preset');  // Ganti dengan nama preset unsigned Anda
  
    try {
      // Menggunakan fetch untuk mengupload ke Cloudinary
      const response = await fetch('https://api.cloudinary.com/v1_1/dtswoxdm7/image/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
  
      // Mengembalikan URL gambar yang diupload
      if (data.secure_url) {
        return data.secure_url;
      } else {
        setError('Gagal mengupload foto. Silakan coba lagi.');
        return null;
      }
    } catch (error) {
      setError('Gagal mengupload foto. Silakan coba lagi.');
      return null;
    }
  };

  // storage firebase 

  // const handleUploadPhoto = async (): Promise<string | null> => {
  //   if (!photoFile || !userProfile) return userProfile?.photoURL || null;
  //   const storage = getStorage();
  //   const photoRef = ref(storage, `profilePictures/${userProfile.userId}`);
  //   await uploadBytes(photoRef, photoFile);
  //   return await getDownloadURL(photoRef);
  // };

  const handleSaveChanges = async () => {
    if (!userProfile) {
      setError('Profil tidak tersedia');
      return;
    }
    const photoURL = await handleUploadPhoto();
    const userRef = doc(db, 'users', userProfile.userId);
    await updateDoc(userRef, {
      name,
      email,
      nim: role === 'mahasiswa' ? nim : '', // Hanya simpan NIM jika role adalah mahasiswa
      photoURL,
    });

    const updatedProfile = { ...userProfile, name, email, nim: role === 'mahasiswa' ? nim : '', photoURL };
    setUserProfile(updatedProfile);
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));

    onClose();
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      setError('Password baru dan konfirmasi tidak cocok');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password baru harus minimal 6 karakter');
      return;
    }

    const auth = getAuth();
    const user = auth.currentUser;

    if (user && password && newPassword) {
      try {
        const credential = EmailAuthProvider.credential(user.email || '', password);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
        setError(null);
        alert('Password berhasil diubah');
        onClose();
      } catch (error: any) {
        if (error.code === 'auth/wrong-password') {
          setError('Password lama salah. Coba lagi.');
        } else {
          setError('Gagal memperbarui password. Silakan coba lagi.');
        }
      }
    } else {
      setError('Semua field harus diisi.');
    }
  };

  return (
    <>
      {isOpen && userProfile && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-4">Edit Profil</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Nama</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              />
            </div>
            {role === 'mahasiswa' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">NIM</label>
                <input
                  type="text"
                  value={nim}
                  onChange={(e) => setNim(e.target.value)}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                />
              </div>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Foto Profil</label>
              <input
                type="file"
                onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Password Lama</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Password Baru</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700">Konfirmasi Password Baru</label>
              <input
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className="w-full mt-1 p-2 border border-gray-300 rounded-md"
              />
            </div>

            <button
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg w-full"
              onClick={handleChangePassword}
            >
              Ganti Password
            </button>
            <button
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg w-full mt-4"
              onClick={handleSaveChanges}
            >
              Simpan Perubahan
            </button>

            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
        </div>
      )}
    </>
  );
};

export default ModalEditProfile;
