import { db } from '@/firebase/firebaseconfig'
import { collection, addDoc, updateDoc, doc, deleteDoc, getDocs } from 'firebase/firestore';

// Ambil daftar pengajuan bimbingan
export const getPengajuanBimbingan = async () => {
    const pengajuanRef = collection(db, 'pengajuan-bimbingan');
    const snapshot = await getDocs(pengajuanRef);
    const pengajuanList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return pengajuanList;
};

// Tambah pengajuan bimbingan baru
export const createPengajuanBimbingan = async (pengajuan) => {
    const pengajuanRef = collection(db, 'pengajuan-bimbingan');
    const docRef = await addDoc(pengajuanRef, pengajuan);
    return { id: docRef.id, ...pengajuan };
};

// Update pengajuan bimbingan
export const updatePengajuanBimbingan = async (id, pengajuan) => {
    const pengajuanRef = doc(db, 'pengajuan-bimbingan', id);
    await updateDoc(pengajuanRef, pengajuan);
    return { id, ...pengajuan };
};

// Hapus pengajuan bimbingan
export const deletePengajuanBimbingan = async (id) => {
    const pengajuanRef = doc(db, 'pengajuan-bimbingan', id);
    await deleteDoc(pengajuanRef);
};
