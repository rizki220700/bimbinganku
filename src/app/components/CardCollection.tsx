'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface CardCollectionProps {
  title: string;
  count: number;
  category: 'listMahasiswa' | 'pengajuan' | 'jadwal';
  route?: string;
  onClick?: () => void;
}

const CardCollection: React.FC<CardCollectionProps> = ({ title, count, category, route }) => {
  const router = useRouter();

  const getCardColor = (category: string) => {
    switch (category) {
      case 'listMahasiswa':
        return 'bg-blue-100 text-blue-600';
      case 'pengajuan':
        return 'bg-green-100 text-green-600';
      case 'jadwal':
        return 'bg-yellow-100 text-yellow-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const handleDetailClick = () => {
    router.push(route || `/dashboard/${category}`);
  };

  return (
    <div
      className={`p-6 rounded-lg shadow-md hover:shadow-lg cursor-pointer ${getCardColor(category)}`}
    >
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-4xl font-bold">{count}</p>
      <button
        onClick={handleDetailClick}
        className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
      >
        Lihat Detail
      </button>
    </div>
  );
};

export default CardCollection;
