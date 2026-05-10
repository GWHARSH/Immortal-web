import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Megaphone } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function AnnouncementPopup() {
  const [announcement, setAnnouncement] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const fetchAnnouncement = async () => {
      try {
        const { data, error } = await supabase
          .from('settings')
          .select('announcement_text, announcement_active')
          .single();

        if (!error && data && data.announcement_active && data.announcement_text) {
          // Check if user has dismissed this particular announcement
          const dismissedKey = `dismissed_announcement_${btoa(data.announcement_text).slice(0, 20)}`;
          const wasDismissed = sessionStorage.getItem(dismissedKey);
          
          if (!wasDismissed) {
            setTimeout(() => {
              setAnnouncement(data.announcement_text);
              setVisible(true);
            }, 2000); // Delay 2s so the site loads first
          }
        }
      } catch (err) {
        // Settings table might not have announcement columns yet
      }
    };

    fetchAnnouncement();
  }, []);

  const handleDismiss = () => {
    if (announcement) {
      const dismissedKey = `dismissed_announcement_${btoa(announcement).slice(0, 20)}`;
      sessionStorage.setItem(dismissedKey, 'true');
    }
    setVisible(false);
    setTimeout(() => setAnnouncement(null), 400);
  };

  if (!announcement) return null;

  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 480;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="announcement-popup"
          initial={{ 
            opacity: 0, 
            x: isMobile ? '-50%' : 0, 
            y: 20, 
            scale: 0.9 
          }}
          animate={{ 
            opacity: 1, 
            x: isMobile ? '-50%' : 0, 
            y: 0, 
            scale: 1 
          }}
          exit={{ 
            opacity: 0, 
            x: isMobile ? '-50%' : -80, 
            scale: 0.9 
          }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
        >
          <div className="announcement-popup__glow" />
          <div className="announcement-popup__header">
            <div className="announcement-popup__icon">
              <Megaphone size={16} />
            </div>
            <span className="announcement-popup__label">Announcement</span>
            <button className="announcement-popup__close" onClick={handleDismiss}>
              <X size={14} />
            </button>
          </div>
          <p className="announcement-popup__text">{announcement}</p>
          <div className="announcement-popup__progress" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
