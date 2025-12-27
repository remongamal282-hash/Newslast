import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-auto">
      <div className="container mx-auto px-4 text-center">
        <p>© {new Date().getFullYear()} شركة مياه الشرب والصرف الصحى بأسيوط والوادى الجديد. جميع الحقوق محفوظة.</p>
      </div>
    </footer>
  );
};
