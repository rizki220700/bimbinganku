import { db } from '@/firebase/firebaseconfig'
import { collection, addDoc, updateDoc, doc, deleteDoc, getDocs } from 'firebase/firestore';

// Ambil daftar pengguna
export const getUsers = async () => {
    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    const usersList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return usersList;
};

// Tambah pengguna baru
export const createUser = async (user) => {
    const usersRef = collection(db, 'users');
    const docRef = await addDoc(usersRef, user);
    return { id: docRef.id, ...user };
};

// Update pengguna
export const updateUser = async (id, user) => {
    const userRef = doc(db, 'users', id);
    await updateDoc(userRef, user);
    return { id, ...user };
};

// Hapus pengguna
export const deleteUser = async (id) => {
    const userRef = doc(db, 'users', id);
    await deleteDoc(userRef);
};
