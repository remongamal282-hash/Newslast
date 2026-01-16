import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Home } from './pages/Home';
import { NewsDetails } from './pages/NewsDetails';
import logo from './assets/logo.png';

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    document.documentElement.dir = 'rtl';
    document.documentElement.lang = 'ar';

    // Handle Redirects from SSR Fallback
    const params = new URLSearchParams(location.search);
    const redirectUrl = params.get('redirect');
    if (redirectUrl) {
      navigate(redirectUrl, { replace: true });
    }
  }, [location, navigate]);

  const defaultTitle = "شركة مياه الشرب والصرف الصحى بأسيوط والوادى الجديد";
  const defaultDescription = "الموقع الرسمي لشركة مياه الشرب والصرف الصحى بأسيوط والوادى الجديد - تابع أحدث الأخبار والخدمات.";
  const logoUrl = new URL(logo, window.location.origin).href;
  const siteUrl = window.location.href;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <Helmet>
        <title>{defaultTitle}</title>
        <meta name="description" content={defaultDescription} />
        <meta property="og:site_name" content={defaultTitle} />
        <meta property="og:title" content={defaultTitle} />
        <meta property="og:description" content={defaultDescription} />
        <meta property="og:image" content={logoUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={siteUrl} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={logoUrl} />
      </Helmet>
      <Header />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/news/:id" element={<NewsDetails />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
