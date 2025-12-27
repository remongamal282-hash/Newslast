import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { fetchNewsById } from '../api/news';
import { NewsItem } from '../types/news';
import { getImageUrl } from '../api/news';
import { Calendar, User, ArrowRight, Loader2, Facebook, MessageCircle, Share2, ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import logo from '../assets/logo.png';

export const NewsDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [news, setNews] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const loadNewsItem = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const item = await fetchNewsById(parseInt(id));
        setNews(item || null);
      } catch (error) {
        console.error("Failed to fetch news details", error);
      } finally {
        setLoading(false);
      }
    };

    loadNewsItem();
  }, [id]);

  const handleFacebookShare = () => {
    const url = window.location.href;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
  };

  const handleWhatsAppShare = () => {
    const url = window.location.href;
    const text = news?.title || '';
    window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
  };

  const nextImage = () => {
    if (!news?.news_images) return;
    setCurrentIndex((prev) => (prev === news.news_images!.length - 1 ? 0 : prev + 1));
  };

  const prevImage = () => {
    if (!news?.news_images) return;
    setCurrentIndex((prev) => (prev === 0 ? news.news_images!.length - 1 : prev - 1));
  };

  // Construct meta data
  const pageTitle = news ? `${news.title} - شركة مياه الشرب والصرف الصحى بأسيوط` : 'تفاصيل الخبر';
  const pageDescription = news ? news.content.substring(0, 150) + '...' : 'تفاصيل الخبر من شركة مياه الشرب والصرف الصحى بأسيوط والوادى الجديد';
  const pageUrl = window.location.href;
  
  // Image logic: News Image -> Logo -> Fallback
  const newsImageUrl = news?.image ? getImageUrl(news.image) : undefined;
  const logoUrl = new URL(logo, window.location.origin).href;
  const ogImage = newsImageUrl || logoUrl;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!news) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">الخبر غير موجود</h2>
        <Link to="/" className="text-blue-600 hover:underline">العودة إلى الرئيسية</Link>
      </div>
    );
  }

  // Filter out unwanted text from content
  const cleanContent = news.content
    .replace(/لمزيد من التفاصيل/g, '')
    .replace(/اقرأ المزيد/g, '');

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:url" content={pageUrl} />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={ogImage} />
      </Helmet>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
        {/* Image Gallery */}
        {news.news_images && news.news_images.length > 0 ? (
          <div className="relative h-[300px] md:h-[500px] bg-gray-100 group">
            <AnimatePresence mode='wait'>
              <motion.img
                key={currentIndex}
                src={getImageUrl(news.news_images[currentIndex].path)}
                alt={news.title}
                className="w-full h-full object-contain"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            </AnimatePresence>
            
            {news.news_images.length > 1 && (
              <>
                <button 
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {currentIndex + 1} / {news.news_images.length}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="h-64 bg-gray-100 flex items-center justify-center text-gray-400">
            <ImageIcon className="w-12 h-12 mb-2" />
            <span>لا توجد صور</span>
          </div>
        )}

        <div className="p-6 md:p-8">
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6 border-b border-gray-100 pb-4">
            <div className="flex items-center">
              <Calendar className="w-4 h-4 ml-2 text-blue-600" />
              {format(new Date(news.date), 'dd MMMM yyyy', { locale: ar })}
            </div>
            <div className="flex items-center">
              <User className="w-4 h-4 ml-2 text-blue-600" />
              {news.author}
            </div>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 leading-tight">
            {news.title}
          </h1>

          <div 
            className="prose prose-lg max-w-none text-gray-700 leading-relaxed mb-8"
            dangerouslySetInnerHTML={{ __html: cleanContent }}
          />

          <div className="flex items-center justify-between pt-6 border-t border-gray-100">
            <div className="flex gap-3">
              <button 
                onClick={handleFacebookShare}
                className="p-2 rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                title="مشاركة على فيسبوك"
              >
                <Facebook className="w-5 h-5" />
              </button>
              <button 
                onClick={handleWhatsAppShare}
                className="p-2 rounded-full bg-green-50 text-green-600 hover:bg-green-100 transition-colors"
                title="مشاركة على واتساب"
              >
                <MessageCircle className="w-5 h-5" />
              </button>
              <button 
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: news.title,
                      text: news.content.substring(0, 100),
                      url: window.location.href,
                    });
                  }
                }}
                className="p-2 rounded-full bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors"
                title="مشاركة"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            <Link 
              to="/" 
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              العودة للأخبار
              <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
