import React from 'react';
import { Link } from 'react-router-dom';
import { NewsItem } from '../types/news';
import { getImageUrl } from '../api/news';
import { Calendar, User, ArrowRight } from 'lucide-react';

interface NewsCardProps {
  article: NewsItem;
}

export const NewsCard: React.FC<NewsCardProps> = ({ article }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Strip HTML tags from content for preview
  const stripHtml = (html: string) => {
    const tmp = document.createElement('DIV');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full border border-gray-100 group" dir="rtl">
      <div className="h-48 overflow-hidden relative">
        <img 
          src={getImageUrl(article.image)} 
          alt={article.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=2070&auto=format&fit=crop';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-center text-xs text-gray-500 mb-3 space-x-4 space-x-reverse">
          <span className="flex items-center">
            <Calendar className="w-3 h-3 ml-1" />
            {formatDate(article.date)}
          </span>
          <span className="flex items-center truncate max-w-[150px]">
            <User className="w-3 h-3 ml-1" />
            {article.author}
          </span>
        </div>
        
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 leading-tight hover:text-blue-600 transition-colors">
          <Link to={`/news/${article.id}`}>
            {article.title}
          </Link>
        </h3>
        
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-1">
          {stripHtml(article.content)}
        </p>
        
        <div className="mt-auto pt-4 border-t border-gray-100 flex justify-end items-center">
          <Link 
            to={`/news/${article.id}`}
            className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors group"
          >
            اقرأ المزيد <ArrowRight className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform rotate-180" />
          </Link>
        </div>
      </div>
    </div>
  );
};
