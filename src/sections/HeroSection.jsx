import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Volume2, VolumeX } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useDevicePerformance } from '../hooks/useDevicePerformance';
import { forceHttps } from '../utils/security';
import heroImg from '/hero-f1.jpg';

// ── Shared social icons map ──────────────────────────────────
const SocialIcons = {
  instagram: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
  ),
  twitter: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
  ),
  youtube: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 7.1C2.5 7.1 2 9.5 2 12c0 2.5.5 4.9.5 4.9.3 1.1 1.2 2 2.3 2.3C7.3 19.5 12 19.5 12 19.5s4.7 0 7.2-.3c1.1-.3 2-1.2 2.3-2.3.5-1.7.5-4.9.5-4.9s0-3.3-.5-4.9C21.2 6 20.3 5.1 19.2 4.8 16.7 4.5 12 4.5 12 4.5s-4.7 0-7.2.3C3.7 5.1 2.8 6 2.5 7.1z" /><polygon points="9.5 8.5 16 12 9.5 15.5 9.5 8.5" /></svg>
  ),
  github: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg>
  ),
  discord: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.27 4.57c-1.3-.6-2.69-1.05-4.14-1.3-.18.33-.39.7-.54 1.06-1.54-.23-3.07-.23-4.59 0-.15-.36-.36-.73-.54-1.06-1.45.25-2.84.7-4.14 1.3-2.62 3.91-3.33 7.72-2.98 11.47 1.74 1.28 3.42 2.06 5.06 2.57.41-.56.77-1.16 1.08-1.8-.59-.22-1.15-.51-1.68-.84.14-.1.28-.21.41-.32 3.3 1.53 6.89 1.53 10.18 0 .13.11.27.22.41.32-.53.33-1.09.62-1.68.84.31.64.67 1.24 1.08 1.8 1.64-.51 3.32-1.29 5.06-2.57.43-4.4-.73-8.19-2.98-11.47zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.83 2.12-1.89 2.12z" /></svg>
  ),
};

function SocialsRow({ socials, onSocialClick, className = '' }) {
  const entries = Object.entries(socials).filter(([, links]) => links[0]?.url);
  if (!entries.length) return null;
  return (
    <div className={`hero-socials ${className}`}>
      {entries.map(([key, links]) => (
        <motion.a
          key={key}
          href={links[0].url}
          onClick={(e) => onSocialClick(e, key, links)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={key}
          className="hero-social-icon"
          whileHover={{ scale: 1.1, y: -2 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'tween', duration: 0.15 }}
        >
          {SocialIcons[key]}
        </motion.a>
      ))}
    </div>
  );
}

// Helper to render subtitle with line breaks
function HeroSubtitle({ text, className = '' }) {
  const lines = (text || '').split('\n');
  return (
    <p className={`hs__subtitle ${className}`}>
      {lines.map((line, i) => (
        <span key={i}>{line}{i < lines.length - 1 && <br />}</span>
      ))}
    </p>
  );
}

// ══════════════════════════════════════════════════════
//  STYLE — APEX (Exclusive Locked Theme, CPU Optimized)
// ══════════════════════════════════════════════════════
const GITHUB_RAW_VIDEO = 'https://raw.githubusercontent.com/GWHARSH/Immortal-web-4/main/public/bg-video.mp4';
const DEFAULT_MOTION_VIDEO = 'https://assets.mixkit.co/videos/preview/mixkit-abstract-technology-mesh-network-41559-large.mp4';

function StyleApex({ socials, onSocialClick, scrollDown, heroContent, settings }) {
  const performanceTier = useDevicePerformance();
  const isMobile = typeof window !== 'undefined' && (window.innerWidth <= 768 || 'ontouchstart' in window);
  const shouldRenderVideo = (settings?.motion_bg_type || 'video') === 'video' && !isMobile && performanceTier === 'high';

  const [videoSrc, setVideoSrc] = useState(() => {
    const dbUrl = settings?.motion_bg_url;
    if (dbUrl && dbUrl.startsWith('http') && !dbUrl.includes('idb://') && !dbUrl.includes('firestore_media://')) {
      return forceHttps(dbUrl);
    }
    return '/bg-video.mp4';
  });
  const bgOpacity = settings?.motion_bg_opacity ? Number(settings.motion_bg_opacity) : 0.72;

  useEffect(() => {
    const dbUrl = settings?.motion_bg_url;
    if (dbUrl && dbUrl.startsWith('http') && !dbUrl.includes('idb://') && !dbUrl.includes('firestore_media://')) {
      setVideoSrc(forceHttps(dbUrl));
    } else {
      setVideoSrc('/bg-video.mp4');
    }
  }, [settings?.motion_bg_url, performanceTier]);

  const handleVideoError = () => {
    console.warn('[HeroSection] Video load error, trying fallback');
    if (videoSrc.includes('/bg-video')) {
      setVideoSrc(GITHUB_RAW_VIDEO);
    } else if (videoSrc === GITHUB_RAW_VIDEO) {
      setVideoSrc(DEFAULT_MOTION_VIDEO);
    }
  };

  return (
    <div className="hs hs--apex">
      {shouldRenderVideo ? (
        <video
          key={videoSrc}
          src={videoSrc}
          autoPlay
          loop
          muted
          playsInline
          onError={handleVideoError}
          className="hs__bg-img hs__bg-video"
          style={{
            opacity: bgOpacity,
            filter: 'brightness(1.15) contrast(1.06)',
          }}
        />
      ) : (
        <img
          src={forceHttps(settings?.custom_banner_url || settings?.motion_bg_url) || heroImg}
          alt=""
          className="hs__bg-img"
          aria-hidden="true"
          loading="eager"
        />
      )}
      <div className="hs__overlay hs__overlay--apex" />
      <div className="hs__noise" />

      {/* Lightweight, CPU-friendly background orbs */}
      <div className="hs__orbs">
        <div className="hs__orb hs__orb--1" />
        <div className="hs__orb hs__orb--2" />
      </div>

      <div className="hs__content hs__content--center">
        <p className="hs__eyebrow">
          {heroContent.eyebrow}
        </p>

        <p className="hs__greeting">hi i am</p>
        <h1 className="hs__title hs__title--apex">
          <span className="hs__t-gradient">{heroContent.titleFirst} {heroContent.titleLast}</span>
        </h1>

        <div className="hs__apex-rule" />

        <HeroSubtitle text={heroContent.description} />

        <SocialsRow socials={socials} onSocialClick={onSocialClick} className="hero-socials--center" />
      </div>

      <button className="hs__scroll" onClick={scrollDown} aria-label="Scroll to content">
        <ChevronDown size={26} />
      </button>
      <div className="hs__fade-bottom" />
    </div>
  );
}

export default function HeroSection() {
  const { settings } = useSettings();
  const [isMuted, setIsMuted] = useState(true);
  const [modalData, setModalData] = useState(null);
  const audioRef = useRef(null);

  const parseSocials = (val) => {
    try {
      if (!val) return [];
      return typeof val === 'string' && val.startsWith('[')
        ? JSON.parse(val)
        : [{ title: 'Main', url: val }];
    } catch { return [{ title: 'Main', url: val }]; }
  };

  const socials = {
    instagram: settings ? parseSocials(settings.instagram) : [],
    twitter: settings ? parseSocials(settings.twitter) : [],
    youtube: settings ? parseSocials(settings.youtube) : [],
    github: settings ? parseSocials(settings.github) : [],
    discord: settings ? parseSocials(settings.discord) : [],
  };

  const bgMusic = forceHttps(settings?.bg_music_url) || '/bg-music.mp3';

  const heroContent = {
    title: settings?.hero_title || 'IMMORTAL',
    description: settings?.hero_description || '',
    eyebrow: settings?.hero_eyebrow || '',
  };

  // Parse title into first/last parts
  const titleParts = (heroContent.title || 'IMMORTAL').trim().split(/\s+/);
  const titleLast = titleParts.length > 1 ? titleParts.pop() : '';
  const titleFirst = titleParts.join(' ');
  const parsedHero = {
    ...heroContent,
    titleFirst: titleFirst || heroContent.title,
    titleLast: titleLast,
  };

  const handleSocialClick = (e, platform, links) => {
    if (links && links.length > 1) {
      e.preventDefault();
      setModalData({ platform, links });
    }
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isMuted) { audioRef.current.play().catch(() => {}); }
    else { audioRef.current.pause(); }
    setIsMuted(!isMuted);
  };

  const scrollDown = () => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <section className="hero-wrapper" id="hero">
      <StyleApex socials={socials} onSocialClick={handleSocialClick} scrollDown={scrollDown} heroContent={parsedHero} settings={settings} />



      {/* ── Social link modal ── */}
      <AnimatePresence>
        {modalData && (
          <motion.div className="social-modal-overlay"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setModalData(null)}>
            <motion.div className="social-modal"
              initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 10 }}
              transition={{ duration: 0.18 }}
              onClick={e => e.stopPropagation()}>
              <h3 className="social-modal__title">
                Choose <span className="text-accent">{modalData.platform}</span> Account
              </h3>
              <div className="social-modal__list">
                {modalData.links.map((link, idx) => (
                  <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="social-modal__item">
                    <span>{link.title || 'Visit Profile'}</span>
                    <ChevronDown size={16} style={{ transform: 'rotate(-90deg)' }} />
                  </a>
                ))}
              </div>
              <button className="btn btn--outline btn--full" style={{ marginTop: '20px' }}
                onClick={() => setModalData(null)}>Cancel</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
