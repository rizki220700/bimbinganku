// lib/cloudinary.js
import { Cloudinary } from 'cloudinary-core';

// Inisialisasi Cloudinary
const cloudinary = new Cloudinary({
  cloud_name: 'dsriaj7zd',  // Ganti dengan cloud_name Anda
  secure: true,             // Gunakan HTTPS
});

export default cloudinary;
