import { useState, useEffect } from 'react';

// Tipe User dengan properti opsional
interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    nim?: string;
    photoURL?: string;
    progress?: string;
    password?: string; // Menambahkan password sebagai properti opsional
}

interface ModalEditUserProps {
    user: User | null;
    closeModal: () => void;
    updateUsers: (updatedUser: User) => void;
}

const ModalEditUser: React.FC<ModalEditUserProps> = ({ user, closeModal, updateUsers }) => {
    const [formData, setFormData] = useState<User>({
        id: '',
        name: '',
        email: '',
        role: '',
        nim: '',
        photoURL: '',
        progress: '',
        password: '', // Menambahkan password dalam formData
    });

    useEffect(() => {
        if (user) {
            setFormData({ ...user, password: '' }); // Kosongkan password untuk edit
        } else {
            setFormData({
                id: '',
                name: '',
                email: '',
                role: '',
                nim: '',
                photoURL: '',
                progress: '',
                password: '',
            });
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = () => {
        if (!formData.name || !formData.email || !formData.role) {
            alert('Harap isi nama, email, dan role.');
            return;
        }

        // Validasi password (jika diubah)
        if (formData.password && formData.password.length < 6) {
            alert('Password minimal 6 karakter.');
            return;
        }

        // Jika tidak ada perubahan pada password, kosongkan
        const updatedUser = { ...formData };
        if (!updatedUser.password) {
            delete updatedUser.password;
        }

        updateUsers(updatedUser);
        closeModal();
    };

    return (
        <div className="modal fixed inset-0 flex items-center justify-center bg-gray-700 bg-opacity-50 z-50">
            <div className="modal-content bg-white p-6 rounded-lg w-96 shadow-lg">
                <h2 className="text-2xl font-bold mb-4">
                    {user ? 'Edit Pengguna' : 'Tambah Pengguna'}
                </h2>

                {/* Nama */}
                <label className="block mb-2">Nama</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full border p-2 mb-4"
                />

                {/* Email */}
                <label className="block mb-2">Email</label>
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full border p-2 mb-4"
                />

                {/* Role */}
                <label className="block mb-2">Role</label>
                <input
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full border p-2 mb-4"
                />

                {/* Password (Hanya Muncul Saat Edit Data Pengguna) */}
                {user && (
                    <>
                        <label className="block mb-2">Password (Opsional)</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full border p-2 mb-4"
                        />
                        <small className="text-gray-500">Kosongkan jika tidak ingin mengubah password.</small>
                    </>
                )}

                {/* Tombol Aksi */}
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
    );
};

export default ModalEditUser;
