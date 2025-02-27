// components/Footer.tsx

'use client';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-6">
      <div className="max-w-7xl mx-auto text-center">
        <p className="text-sm">
          &copy; 2025 Bimbingan Skripsi. All Rights Reserved.
        </p>
        <div className="mt-2">
          <a
            href="/privacy-policy"
            className="text-indigo-300 hover:text-indigo-500 text-sm"
          >
            Privacy Policy
          </a>
          <span className="mx-2">|</span>
          <a
            href="/contact"
            className="text-indigo-300 hover:text-indigo-500 text-sm"
          >
            Contact Us
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
