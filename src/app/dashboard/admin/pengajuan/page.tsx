'use client'
import { useState, useEffect } from 'react';
import { getPengajuanBimbingan, deletePengajuanBimbingan } from '@/app/services/pengajuanService';
import { getUsers } from '@/app/services/userService'; // Pastikan sudah ada service untuk mengambil data pengguna
import ModalEditPengajuan from '@/app/components/ModalEditPengajuan';
import Sidebar from '@/app/components/Sidebar'; // Impor Sidebar

interface Pengajuan {
    id: string;
    dosen: string;
    fileURL: string;
    pesan: string;
    status: string;
    timestamp: string;
    userId: string;
}

const DataPengajuan = () => {
    const [pengajuan, setPengajuan] = useState<Pengajuan[]>([]); 
    const [users, setUsers] = useState<any[]>([]);  
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPengajuan, setSelectedPengajuan] = useState<Pengajuan | null>(null);

    useEffect(() => {
        const fetchPengajuan = async () => {
            const pengajuanData = await getPengajuanBimbingan();
            const usersData = await getUsers();
            setUsers(usersData);

            const formattedPengajuan = pengajuanData.map((item: any) => ({
                id: item.id,
                dosen: item.dosen,
                fileURL: item.fileURL,
                pesan: item.pesan,
                status: item.status,
                timestamp: item.timestamp,
                userId: item.userId,
            }));

            setPengajuan(formattedPengajuan);
        };

        fetchPengajuan();
    }, []);

    const getDosenName = (dosenId: string) => {
        const dosen = users.find((user) => user.id === dosenId);
        return dosen ? dosen.name : 'Dosen Tidak Ditemukan'; 
    };

    const handleEditPengajuan = (pengajuan: Pengajuan) => {
        setSelectedPengajuan(pengajuan);
        setIsModalOpen(true);
    };

    const handleDeletePengajuan = async (pengajuanId: string) => {
        if (confirm('Apakah Anda yakin ingin menghapus pengajuan ini?')) {
            await deletePengajuanBimbingan(pengajuanId);
            setPengajuan(pengajuan.filter(p => p.id !== pengajuanId));
        }
    };

    const handleAddPengajuan = () => {
        setSelectedPengajuan(null);
        setIsModalOpen(true);
    };

    return (
        <div className="flex">
            {/* Sidebar */}
            <Sidebar />

            <div className="container mx-auto p-6 flex-1">
                <h1 className="text-3xl font-extrabold text-gray-800 mb-6">Data Pengajuan Bimbingan</h1>

                <button onClick={handleAddPengajuan} className="bg-blue-500 text-white px-4 py-2 rounded-lg mb-4 hover:bg-blue-700 transition duration-300">
                    Tambah Pengajuan
                </button>

                <table className="w-full table-auto border-collapse border border-gray-300">
                    <thead>
                        <tr>
                            <th className="border px-4 py-2">No</th>
                            <th className="border px-4 py-2">Dosen</th>
                            <th className="border px-4 py-2">Pesan</th>
                            <th className="border px-4 py-2">Status</th>
                            <th className="border px-4 py-2">Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pengajuan.map((p, index) => (
                            <tr key={p.id}>
                                <td className="border px-4 py-2">{index + 1}</td>
                                <td className="border px-4 py-2">{getDosenName(p.dosen)}</td>
                                <td className="border px-4 py-2">{p.pesan}</td>
                                <td className="border px-4 py-2">{p.status}</td>
                                <td className="border px-4 py-2 flex space-x-2">
                                    <button
                                        onClick={() => handleEditPengajuan(p)}
                                        className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition duration-300"
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeletePengajuan(p.id)}
                                        className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-300"
                                    >
                                        Hapus
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {isModalOpen && (
                    <ModalEditPengajuan
                        pengajuan={selectedPengajuan}
                        closeModal={() => setIsModalOpen(false)}
                        updatePengajuan={(updatedPengajuan) => {
                            if (selectedPengajuan) {
                                setPengajuan(pengajuan.map(p => p.id === updatedPengajuan.id ? updatedPengajuan : p));
                            } else {
                                setPengajuan([...pengajuan, updatedPengajuan]);
                            }
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default DataPengajuan;
