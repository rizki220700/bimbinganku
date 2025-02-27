'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from '@/firebase/firebaseconfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import bcrypt from 'bcryptjs';
import { FaUserShield } from 'react-icons/fa';

const AdminLoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        try {
            // Query Firestore untuk mencocokkan admin dengan username
            const q = query(collection(db, 'admins'), where('username', '==', username));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                setError('Username atau password salah.');
                return;
            }

            const adminData = querySnapshot.docs[0].data();
            const storedPassword = adminData.password; // password yang di-hash dari Firestore

            // Verifikasi password menggunakan bcrypt
            const isPasswordValid = bcrypt.compareSync(password, storedPassword);

            if (!isPasswordValid) {
                setError('Username atau password salah.');
                return;
            }

            // Simpan token di localStorage (misalnya token berbasis UID)
            const token = JSON.stringify({ userId: querySnapshot.docs[0].id, role: 'admin' });
            localStorage.setItem('userToken', token);

            // Redirect ke dashboard admin
            router.push('/dashboard/admin');
        } catch (error) {
            setError('Terjadi kesalahan. Coba lagi nanti.');
            console.error('Login error:', error);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-96">
                <div className="flex justify-center mb-6">
                    <FaUserShield className="text-6xl text-blue-500" />
                </div>
                <h1 className="text-2xl font-semibold text-center mb-4">Admin Login</h1>
                {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm mb-2">Username</label>
                        <input 
                            type="text"
                            className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm mb-2">Password</label>
                        <input 
                            type="password"
                            className="w-full px-4 py-2 rounded bg-gray-700 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 transition duration-300 rounded-lg text-center font-semibold"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminLoginPage;
