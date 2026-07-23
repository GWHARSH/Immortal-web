import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import UploadsPage from './pages/UploadsPage';
import PackagesPage from './pages/PackagesPage';
import LoginPage from './pages/LoginPage';
import AdminPage from './pages/AdminPage';
import UploadDetails from './pages/UploadDetails';
import PackageDetails from './pages/PackageDetails';
import { NotificationProvider } from './context/NotificationContext';
import AnnouncementPopup from './components/AnnouncementPopup';
import GlobalAudioPlayer from './components/GlobalAudioPlayer';
import ScrollToTop from './components/ScrollToTop';
import SeoHead from './components/SeoHead';
import InteractiveCanvasParticles from './components/InteractiveCanvasParticles';
import CustomCursor from './components/CustomCursor';
import ScrollProgress from './components/ScrollProgress';
import { useTracking } from './hooks/useTracking';
import { useGlobalScrollReveal } from './hooks/useScrollReveal';
import './index.css';

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/uploads" element={<UploadsPage />} />
          <Route path="/uploads/:slug" element={<UploadDetails />} />
          <Route path="/packages" element={<PackagesPage />} />
          <Route path="/packages/:slug" element={<PackageDetails />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function AppInner() {
  useTracking();
  useGlobalScrollReveal();

  useEffect(() => {
    // Only track mouse position CSS variables on desktop devices with fine pointer
    if (window.innerWidth <= 768 || window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    let rafId;
    const handleMouseMove = (e) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth) * 100;
        const y = (e.clientY / window.innerHeight) * 100;
        document.documentElement.style.setProperty('--mouse-x', `${x}%`);
        document.documentElement.style.setProperty('--mouse-y', `${y}%`);
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <>
      <ScrollProgress />
      <CustomCursor />
      <InteractiveCanvasParticles />
      <div className="bg-noise" />
      <SeoHead />
      <ScrollToTop />
      <Navbar />

      {/* Floating background ambient dots — hidden on mobile via CSS */}
      <div className="bg-particles">
        <div className="bg-particles__dot bg-particles__dot--1" />
        <div className="bg-particles__dot bg-particles__dot--2" />
        <div className="bg-particles__dot bg-particles__dot--3" />
        <div className="bg-particles__dot bg-particles__dot--4" />
        <div className="bg-particles__dot bg-particles__dot--5" />
        <div className="bg-particles__dot bg-particles__dot--6" />
      </div>

      <AnimatedRoutes />

      <Footer />
      <AnnouncementPopup />
      <GlobalAudioPlayer />
    </>
  );
}

export default function App() {
  return (
    <NotificationProvider>
      <SettingsProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppInner />
          </BrowserRouter>
        </AuthProvider>
      </SettingsProvider>
    </NotificationProvider>
  );
}
