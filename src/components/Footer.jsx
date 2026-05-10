import { Link } from 'react-router-dom';
import { Camera, Send, Play, Code, ArrowUp, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

export default function Footer() {
  const [socials, setSocials] = useState({ 
    instagram: [], twitter: [], youtube: [], github: [], discord: [] 
  });
  const [modalData, setModalData] = useState(null);

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
      }
    });
  }, []);

  const handleSocialClick = (e, platform, links) => {
    if (links && links.length > 1) {
      e.preventDefault();
      setModalData({ platform, links });
    }
  };

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <h3 className="footer__logo">
            <span>HIXX</span> <span className="footer__logo-accent">PLAYZ</span>
          </h3>
          <p className="footer__tagline">The one and only legend.</p>
        </div>

        <div className="footer__nav">
          <h4>Navigation</h4>
          <Link to="/">Home</Link>
          <Link to="/uploads">Uploads</Link>
          <Link to="/packages">Packages</Link>
        </div>

        <div className="footer__nav">
          <h4>Account</h4>
          <Link to="/login">Login</Link>
        </div>

        <div className="footer__socials">
          <h4>Follow</h4>
          <div className="footer__social-icons">
            <a href={socials.instagram[0]?.url || "#"} onClick={(e) => handleSocialClick(e, 'Instagram', socials.instagram)} target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Camera size={20} /></a>
            <a href={socials.twitter[0]?.url || "#"} onClick={(e) => handleSocialClick(e, 'X / Twitter', socials.twitter)} target="_blank" rel="noopener noreferrer" aria-label="Twitter"><Send size={20} /></a>
            <a href={socials.youtube[0]?.url || "#"} onClick={(e) => handleSocialClick(e, 'YouTube', socials.youtube)} target="_blank" rel="noopener noreferrer" aria-label="Youtube"><Play size={20} /></a>
            <a href={socials.github[0]?.url || "#"} onClick={(e) => handleSocialClick(e, 'GitHub', socials.github)} target="_blank" rel="noopener noreferrer" aria-label="Github"><Code size={20} /></a>
            <a href={socials.discord[0]?.url || "#"} onClick={(e) => handleSocialClick(e, 'Discord', socials.discord)} target="_blank" rel="noopener noreferrer" aria-label="Discord">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.27 4.57c-1.3-.6-2.69-1.05-4.14-1.3-.18.33-.39.7-.54 1.06-1.54-.23-3.07-.23-4.59 0-.15-.36-.36-.73-.54-1.06-1.45.25-2.84.7-4.14 1.3-2.62 3.91-3.33 7.72-2.98 11.47 1.74 1.28 3.42 2.06 5.06 2.57.41-.56.77-1.16 1.08-1.8-.59-.22-1.15-.51-1.68-.84.14-.1.28-.21.41-.32 3.3 1.53 6.89 1.53 10.18 0 .13.11.27.22.41.32-.53.33-1.09.62-1.68.84.31.64.67 1.24 1.08 1.8 1.64-.51 3.32-1.29 5.06-2.57.43-4.4-.73-8.19-2.98-11.47zM8.52 14.91c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.84 2.12-1.89 2.12zm6.97 0c-1.03 0-1.89-.95-1.89-2.12s.84-2.12 1.89-2.12c1.06 0 1.9.96 1.89 2.12 0 1.17-.83 2.12-1.89 2.12z" /></svg>
            </a>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <p>&copy; {new Date().getFullYear()} HIXX PLAYZ. All rights reserved.</p>
        <button className="footer__scroll-top" onClick={scrollToTop} aria-label="Scroll to top">
          <ArrowUp size={18} />
        </button>
      </div>

      <AnimatePresence>
        {modalData && (
          <motion.div
            className="social-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setModalData(null)}
          >
            <motion.div
              className="social-modal"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={e => e.stopPropagation()}
            >
              <h3 className="social-modal__title">Choose <span className="text-accent">{modalData.platform}</span> Account</h3>
              <div className="social-modal__list">
                {modalData.links.map((link, idx) => (
                  <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="social-modal__item">
                    <span>{link.title || 'Visit Profile'}</span>
                    <ChevronDown size={18} style={{ transform: 'rotate(-90deg)' }} className="social-modal__icon" />
                  </a>
                ))}
              </div>
              <button className="btn btn--outline btn--full" style={{ marginTop: '24px' }} onClick={() => setModalData(null)}>
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </footer>
  );
}
