'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/firebaseconfig';

const ProgressSkripsi = ({ userId }: { userId: string }) => {
    const [progress, setProgress] = useState<number>(0); // Menyimpan persen progres
    const [progressData, setProgressData] = useState<any>(null); // Menyimpan data progres

    useEffect(() => {
        const fetchProgress = async () => {
            // Mendapatkan referensi dokumen pengguna berdasarkan userId
            const docRef = doc(db, 'users', userId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                // Mengambil data progres skripsi pengguna
                const data = docSnap.data().progress || {}; // Ambil data progres
                setProgressData(data);

                // Menghitung jumlah bab yang sudah selesai
                const completed = Object.values(data).filter((v: any) => v === true).length; // Hitung bab yang selesai
                const total = Object.keys(data).length; // Total jumlah bab yang ada

                // Jika total bab lebih dari 0, hitung progres berdasarkan jumlah bab yang selesai
                if (total > 0) {
                    setProgress((completed / total) * 100); // Hitung persen progres
                } else {
                    setProgress(0); // Jika tidak ada bab, set progress ke 0
                }
            }
        };

        fetchProgress(); // Panggil fungsi untuk mengambil data progres
    }, [userId]); // Efek ini hanya dijalankan jika userId berubah

    return (
        <div className="mt-6 p-4 bg-white rounded-lg shadow-lg">
            <h2 className="text-lg font-semibold mb-4 text-center">PROGRESS SKRIPSI</h2>
            <div className="w-full bg-gray-200 rounded-full h-6 mb-4">
                <div
                    className="bg-blue-500 h-6 rounded-full transition-all"
                    style={{ width: `${progress}%` }} // Sesuaikan lebar progress bar dengan persen progres
                ></div>
            </div>
            <p className="text-center">{Math.round(progress)}% selesai</p> {/* Menampilkan persen progres */}
        </div>
    );
};

export default ProgressSkripsi;
