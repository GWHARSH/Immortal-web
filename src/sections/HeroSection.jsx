import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Volume2, VolumeX } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function HeroSection() {
  const [bgIndex, setBgIndex] = useState(1);
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef(null);
  const [socials, setSocials] = useState({ instagram: [], twitter: [], youtube: [], github: [], discord: [] });
  const [modalData, setModalData] = useState(null);
  const [bgMusic, setBgMusic] = useState('/bg-music.mp3');

  const handleVideoEnded = () => {
    setBgIndex((prev) => (prev >= 8 ? 1 : prev + 1));
  };

  useEffect(() => {
    supabase.from('settings').select('*').single().then(({ data }) => {
      if (data) {
        const parse = (val) => {
          try {
            if (!val) return [];
            return typeof val === 'string' && val.startsWith('[') ? JSON.parse(val) : [{ title: 'Main', url: val }];
          } catch {
            return [{ title: 'Main', url: val }];
          }
        };
        setSocials({
          instagram: parse(data.instagram),
          twitter: parse(data.twitter),
          youtube: parse(data.youtube),
          github: parse(data.github),
          discord: parse(data.discord)
        });
        if (data.bg_music_url) setBgMusic(data.bg_music_url);
      }
    });
  }, []);

  const handleSocialClick = (e, platform, links) => {
    if (links && links.length > 1) {
      e.preventDefault();
      setModalData({ platform, links });
    }
  };

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.play().catch(() => { });
      } else {
        audioRef.current.pause();
      }
      setIsMuted(!isMuted);
    }
  };

  const scrollToAbout = () => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="hero" id="hero">
      <div className="hero__video-wrapper">
        <AnimatePresence mode="wait">
          <motion.video
            key={bgIndex}
            className="hero__video"
            src={`/hero-bg${bgIndex}.mp4`}
            autoPlay
            muted
            playsInline
            preload="metadata"
            onEnded={handleVideoEnded}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.43 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        </AnimatePresence>
        <div className="hero__video-overlay"></div>
        <div className="hero__noise"></div>
      </div>

      {/* Floating orbs */}
      <div className="hero__orbs">
        <div className="hero__orb hero__orb--1" />
        <div className="hero__orb hero__orb--2" />
        <div className="hero__orb hero__orb--3" />
      </div>

      <motion.div
        className="hero__content"
        style={{ transform: 'translateY(4vh)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <motion.p
          className="hero__eyebrow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Genius · Playboy · Philanthropist · Leader
        </motion.p>

        <motion.h1
          className="hero__title"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
        >
          <span className="hero__title-line">HIXX</span>
          <span className="hero__title-line--accent">PLAYZ</span>
        </motion.h1>

        <motion.p
          className="hero__subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          Making digital memories that last forever<br />
          while I enjoy my fking life.
          Unprofessional Discord E-gangster
        </motion.p>

        <motion.div
          className="hero__socials"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          {socials.instagram[0]?.url && (
            <motion.a href={socials.instagram[0]?.url} onClick={(e) => handleSocialClick(e, 'Instagram', socials.instagram)} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hero__social-icon" whileHover={{ scale: 1.15, rotate: 5, y: -4 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
            </motion.a>
          )}
          {socials.twitter[0]?.url && (
            <motion.a href={socials.twitter[0]?.url} onClick={(e) => handleSocialClick(e, 'X / Twitter', socials.twitter)} target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="hero__social-icon" whileHover={{ scale: 1.15, rotate: -5, y: -4 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
            </motion.a>
          )}
          {socials.youtube[0]?.url && (
            <motion.a href={socials.youtube[0]?.url} onClick={(e) => handleSocialClick(e, 'YouTube', socials.youtube)} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="hero__social-icon" whileHover={{ scale: 1.15, rotate: 5, y: -4 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 7.1C2.5 7.1 2 9.5 2 12c0 2.5.5 4.9.5 4.9.3 1.1 1.2 2 2.3 2.3C7.3 19.5 12 19.5 12 19.5s4.7 0 7.2-.3c1.1-.3 2-1.2 2.3-2.3.5-1.7.5-4.9.5-4.9s0-3.3-.5-4.9C21.2 6 20.3 5.1 19.2 4.8 16.7 4.5 12 4.5 12 4.5s-4.7 0-7.2.3C3.7 5.1 2.8 6 2.5 7.1z" /><polygon points="9.5 8.5 16 12 9.5 15.5 9.5 8.5" /></svg>
            </motion.a>
          )}
          {socials.github[0]?.url && (
            <motion.a href={socials.github[0]?.url} onClick={(e) => handleSocialClick(e, 'GitHub', socials.github)} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="hero__social-icon" whileHover={{ scale: 1.15, rotate: -5, y: -4 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg>
            </motion.a>
          )}
          {socials.discord[0]?.url && (
            <motion.a href={socials.discord[0]?.url} onClick={(e) => handleSocialClick(e, 'Discord', socials.discord)} target="_blank" rel="noopener noreferrer" aria-label="Discord" className="hero__social-icon" whileHover={{ scale: 1.15, rotate: 5, y: -4 }} whileTap={{ scale: 0.95 }} transition={{ type: "spring", stiffness: 400, damping: 15 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19.27 4.57c-1.3-.6-2.69-1.05-4.14-1.3-.18.33-.39.7-.54 1.06-1.54-.23-3.07-.23-4.59 0-.15-.36-.36-.73-.54-1.06-1.45.25-2.84.7-4.14 1.3-2.62 3.91-3.33 7.72-2.98 11.47 1.74 1.28 3.42 2.06 5.06 2.57.41-.56.77-1.16 1.08-1.8-.59-.22-1.15-.51-1.68-.84.14-.1.28-.21.41-.32 3.3 1.53 6.89 1.53 10.18 0 .13.11.27.22.41.32-.53.33-1.09.62-1.68.84.31.64.67 1.24 1.08 1.8 1.64-.51 3.32-1.29 5.06-2.57.43-4.4-.73-8.19-2.98-11.47zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.83 2.12-1.89 2.12z" /></svg>
            </motion.a>
          )}
        </motion.div>
      </motion.div>

      <motion.button
        className="hero__scroll-indicator"
        onClick={scrollToAbout}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.8 }}
        aria-label="Scroll down"
      >
        <ChevronDown size={28} />
      </motion.button>
      <div className="hero__fade-bottom"></div>

      <div className="music-toggle">
        <audio ref={audioRef} src={bgMusic} loop />
        <div className="music-toggle__controls">
          <button className="music-toggle__btn" onClick={toggleMusic} aria-label="Toggle Music">
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <div className="music-toggle__slider-wrap">
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              defaultValue="0.5"
              className="music-toggle__slider"
              onChange={(e) => { if (audioRef.current) audioRef.current.volume = e.target.value; }}
            />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {modalData && (
          <motion.div className="social-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModalData(null)}>
            <motion.div className="social-modal" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={e => e.stopPropagation()}>
              <h3 className="social-modal__title">Choose <span className="text-accent">{modalData.platform}</span> Account</h3>
              <div className="social-modal__list">
                {modalData.links.map((link, idx) => (
                  <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="social-modal__item">
                    <span>{link.title || 'Visit Profile'}</span>
                    <ChevronDown size={18} style={{ transform: 'rotate(-90deg)' }} className="social-modal__icon" />
                  </a>
                ))}
              </div>
              <button className="btn btn--outline btn--full" style={{ marginTop: '24px' }} onClick={() => setModalData(null)}>Cancel</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
