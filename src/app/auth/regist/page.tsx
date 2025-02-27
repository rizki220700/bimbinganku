'use client'
import Link from 'next/link';
import { useState } from 'react';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { db } from '@/firebase/firebaseconfig';
import { doc, setDoc } from 'firebase/firestore';

const RegisterPage = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [name, setName] = useState<string>('');  // Nama pengguna baru
  const [role, setRole] = useState<string>('mahasiswa');  // Peran pengguna
  const [nim, setNim] = useState<string>('');  // NIM untuk mahasiswa
  const [errorMessage, setErrorMessage] = useState<string>('');  // Menyimpan pesan error
  const router = useRouter();

  const handleRegister = async () => {
    const auth = getAuth();
    setErrorMessage('');  // Reset pesan error
  
    // Validasi panjang password
    if (password.length < 6) {
      setErrorMessage('Password harus terdiri dari minimal 6 karakter.');
      return;
    }
  
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      // Menyimpan data pengguna ke Firestore dengan progress awal
      await setDoc(doc(db, 'users', user.uid), {
        name,
        email,
        role,
        nim: role === 'mahasiswa' ? nim : null,  // Simpan NIM hanya jika role mahasiswa
        progress: {
          bab1: false,
          bab2: false,
          bab3: false,
          bab4: false,
          bab5: false,
        },  // Nilai progress bab-bab awal
      });
  
      // Redirect ke halaman login setelah registrasi berhasil
      router.push('/auth/login');
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setErrorMessage('Email sudah digunakan oleh pengguna lain.');
      } else if (error.code === 'auth/invalid-email') {
        setErrorMessage('Email tidak valid.');
      } else if (error.code === 'auth/weak-password') {
        setErrorMessage('Password terlalu lemah.');
      } else {
        setErrorMessage('Terjadi kesalahan saat registrasi. Silakan coba lagi.');
      }
      console.error('Error registering:', error);
    }
  };
  

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-500 to-indigo-600">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
        <h1 className="text-3xl font-semibold text-center text-blue-500 mb-6">Create an Account</h1>
        <form onSubmit={(e) => e.preventDefault()}>
          {/* Pesan error jika ada */}
          {errorMessage && <p className="text-red-500 text-sm text-center mb-4">{errorMessage}</p>}
    
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700" htmlFor="name">Full Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              className="w-full p-3 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700" htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full p-3 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700" htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full p-3 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700" htmlFor="role">Role</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-3 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="mahasiswa">Mahasiswa</option>
              <option value="dosen">Dosen</option>
            </select>
          </div>
    
          {/* Form input NIM hanya muncul jika role adalah 'mahasiswa' */}
          {role === 'mahasiswa' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700" htmlFor="nim">NIM</label>
              <input
                type="text"
                id="nim"
                value={nim}
                onChange={(e) => setNim(e.target.value)}
                placeholder="Enter your NIM"
                className="w-full p-3 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}
          
          <button
            type="button"
            onClick={handleRegister}
            className="w-full py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition duration-200"
          >
            Register
          </button>
          
          <p className="text-center text-sm text-gray-500 mt-4">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-blue-500 hover:underline">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
    
  );
};

export default RegisterPage;
