'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar'; // Pastikan import Sidebar
import { getUsers, deleteUser } from '@/app/services/userService';
import ModalEditUser from '@/app/components/ModalEditUser';

// Tipe User dengan properti opsional
interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    nim?: string;       // Properti opsional
    photoURL?: string;  // Properti opsional
    progress?: string;  // Properti opsional
}

const DataPengguna = () => {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            const usersData = await getUsers();

            // Menformat data pengguna dari API agar sesuai dengan tipe User
            const formattedUsers = usersData.map((user: any) => ({
                id: user.id,
                name: user.name || 'Nama Tidak Tersedia',
                email: user.email || 'Email Tidak Tersedia',
                role: user.role || 'Role Tidak Tersedia',
                nim: user.nim, // Properti opsional
                photoURL: user.photoURL,
                progress: user.progress,
            }));

            setUsers(formattedUsers);
        };
        fetchUsers();
    }, []);

    const handleEditUser = (user: User) => {
        setSelectedUser(user);
        setIsModalOpen(true);
    };

    const handleDeleteUser = async (userId: string) => {
        if (confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
            await deleteUser(userId);
            setUsers(users.filter(user => user.id !== userId));
        }
    };

    const handleAddUser = () => {
        setSelectedUser(null);
        setIsModalOpen(true);
    };

    return (
        <div className="flex min-h-screen bg-white text-gray-900">
            {/* Sidebar */}
            <Sidebar />

            <div className="flex-1 p-6">
                <h1 className="text-3xl font-extrabold text-gray-800 mb-6">Data Pengguna</h1>

                {/* Tombol Tambah Pengguna */}
                <button onClick={handleAddUser} className="bg-blue-500 text-white px-4 py-2 rounded-lg mb-4 hover:bg-blue-700 transition duration-300">
                    Tambah Pengguna
                </button>

                {/* Daftar Pengguna */}
                <div className="overflow-x-auto">
                    <table className="min-w-full table-auto border-collapse border border-gray-300">
                        <thead>
                            <tr>
                                <th className="border px-4 py-2">No</th>
                                <th className="border px-4 py-2">Nama</th>
                                <th className="border px-4 py-2">Email</th>
                                <th className="border px-4 py-2">Role</th>
                                <th className="border px-4 py-2">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user, index) => (
                                <tr key={user.id}>
                                    <td className="border px-4 py-2">{index + 1}</td>
                                    <td className="border px-4 py-2">{user.name}</td>
                                    <td className="border px-4 py-2">{user.email}</td>
                                    <td className="border px-4 py-2">{user.role}</td>
                                    <td className="border px-4 py-2 flex space-x-2">
                                        <button
                                            onClick={() => handleEditUser(user)}
                                            className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition duration-300"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteUser(user.id)}
                                            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-300"
                                        >
                                            Hapus
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Modal Edit Pengguna */}
                {isModalOpen && (
                    <ModalEditUser
                        user={selectedUser}
                        closeModal={() => setIsModalOpen(false)}
                        updateUsers={(updatedUser) => {
                            if (selectedUser) {
                                setUsers(users.map(user => user.id === updatedUser.id ? updatedUser : user));
                            } else {
                                setUsers([...users, updatedUser]);
                            }
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default DataPengguna;
