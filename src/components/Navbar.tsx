import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home } from 'lucide-react';
import logo from '../assets/logo.png';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-3 space-x-reverse group shrink-0">
            <img src={logo} alt="Logo" className="h-12 w-auto object-contain" />
            <span className="text-xl font-bold text-gray-900 tracking-tight hidden lg:block">بوابة الأخبار</span>
          </Link>
          
          <div className="flex space-x-1 space-x-reverse bg-gray-100/50 p-1 rounded-xl overflow-hidden">
            <a
              href="https://ascww.org/" 
              target="_blank"
              rel="noopener noreferrer"
              className={`px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition-all duration-200 flex items-center text-center whitespace-nowrap ${
                isActive('/') 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/50'
              }`}
            >
              <Home className="w-4 h-4 ml-2 shrink-0" />
              الموقع الرسمي 
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};
