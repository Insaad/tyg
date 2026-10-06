/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { FloatingWhatsApp } from './components/common/FloatingWhatsApp';
import { WishlistDrawer } from './components/common/WishlistDrawer';
import { AppointmentModal } from './components/common/AppointmentModal';
import { SearchModal } from './components/common/SearchModal';
import { GoogleSheetsModal } from './components/common/GoogleSheetsModal';
import { CinematicIntro } from './components/common/CinematicIntro';

import { HomePage } from './pages/HomePage';
import { CategoryPage } from './pages/CategoryPage';
import { ShopAllPage } from './pages/ShopAllPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { MadeToOrderPage } from './pages/MadeToOrderPage';
import { AboutPage } from './pages/AboutPage';
import { LookbookPage } from './pages/LookbookPage';
import { ContactPage } from './pages/ContactPage';
import { ArrowUp } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentRoute } = useShop();

  const [showIntro, setShowIntro] = useState(true);

  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleEnterIntro = () => {
    setShowIntro(false);
    try {
      sessionStorage.setItem('ashrafi_intro_seen', 'true');
    } catch (e) {
      console.error(e);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderCurrentPage = () => {
    switch (currentRoute) {
      case 'home':
        return <HomePage />;
      case 'shop-all':
        return <ShopAllPage />;
      case 'product-detail':
        return <ProductDetailPage />;
      case 'made-to-order':
        return <MadeToOrderPage />;
      case 'about':
        return <AboutPage />;
      case 'lookbook':
        return <LookbookPage />;
      case 'contact':
        return <ContactPage />;
      default:
        // Any dynamic category from Google Sheets or catalog
        return <CategoryPage categoryId={currentRoute} />;
    }
  };

  return (
    <div className="relative min-h-screen bg-white text-[#1A1816] flex flex-col font-sans selection:bg-[#9E7B3B]/20 selection:text-[#1A1816]">
      {/* 1. Cinematic Intro Screen on Initial Visit */}
      {showIntro && <CinematicIntro onEnter={handleEnterIntro} />}

      {/* 2. Top Header & Navigation with 3-lines menu */}
      <Header />

      {/* 3. Main Page Body */}
      <main className="flex-1">{renderCurrentPage()}</main>

      {/* 4. Luxury Footer */}
      <Footer />

      {/* 5. Persistent Interactive Modals */}
      <WishlistDrawer />
      <AppointmentModal />
      <SearchModal />
      <GoogleSheetsModal />
      <FloatingWhatsApp />

      {/* Back to top button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 left-6 z-40 p-3 bg-white border border-[#E0D8CB] hover:border-[#9E7B3B] text-[#1A1816] hover:text-[#9E7B3B] transition-all shadow-md active:scale-95"
          aria-label="Back to top"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default function App() {
  return (
    <ShopProvider>
      <AppContent />
    </ShopProvider>
  );
}
