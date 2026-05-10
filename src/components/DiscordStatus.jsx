import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { ExternalLink, ChevronDown, Music, Gamepad2, Info } from 'lucide-react';
import { supabase } from '../lib/supabase';

const StatusColors = {
  online: '#23a55a',
  idle: '#f0b232',
  dnd: '#f23f43',
  offline: '#80848e'
};

const StatusLabels = {
  online: 'Online',
  idle: 'Idle',
  dnd: 'Do Not Disturb',
  offline: 'Offline'
};

const SocialIcons = {
  instagram: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></svg>
  ),
  twitter: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
  ),
  youtube: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 7.1C2.5 7.1 2 9.5 2 12c0 2.5.5 4.9.5 4.9.3 1.1 1.2 2 2.3 2.3C7.3 19.5 12 19.5 12 19.5s4.7 0 7.2-.3c1.1-.3 2-1.2 2.3-2.3.5-1.7.5-4.9.5-4.9s0-3.3-.5-4.9C21.2 6 20.3 5.1 19.2 4.8 16.7 4.5 12 4.5 12 4.5s-4.7 0-7.2.3C3.7 5.1 2.8 6 2.5 7.1z" /><polygon points="9.5 8.5 16 12 9.5 15.5 9.5 8.5" /></svg>
  ),
  github: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg>
  )
};

function formatTime(ms) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function DiscordStatus({ discordId }) {
  const [discordData, setDiscordData] = useState(null);
  const [customSettings, setCustomSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalData, setModalData] = useState(null);
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState('0:00');
  const [duration, setDuration] = useState('0:00');
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!discordId) return;
    const fetchAll = async () => {
      try {
        const res = await fetch(`https://api.lanyard.rest/v1/users/${discordId}`);
        const json = await res.json();
        const { data: settings } = await supabase.from('settings').select('*').single();
        if (json.success) {
          setDiscordData(json.data);
          setCustomSettings(settings);
        }
      } catch (err) {
        console.error('Discord fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
    const poll = setInterval(fetchAll, 30000);
    return () => clearInterval(poll);
  }, [discordId]);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!discordData?.spotify?.timestamps) return;
    const { start, end } = discordData.spotify.timestamps;
    const update = () => {
      const now = Date.now();
      const total = end - start;
      const current = now - start;
      setProgress(Math.min(100, Math.max(0, (current / total) * 100)));
      setElapsed(formatTime(current));
      setDuration(formatTime(total));
    };
    update();
    intervalRef.current = setInterval(update, 1000);
    return () => clearInterval(intervalRef.current);
  }, [discordData?.spotify]);

  if (loading) return (
    <div className="dcard-loading">
      <div className="dcard-loading__spinner" />
      <span>Syncing Discord</span>
    </div>
  );
  if (!discordData) return null;

  const { discord_user, discord_status, activities, listening_to_spotify, spotify } = discordData;
  const customStatus = activities?.find(a => a.type === 4);
  const gamingActivity = activities?.find(a => a.type === 0);
  const statusColor = StatusColors[discord_status] || StatusColors.offline;
  const statusLabel = StatusLabels[discord_status] || 'Offline';

  const avatarUrl = discord_user.avatar
    ? `https://cdn.discordapp.com/avatars/${discord_user.id}/${discord_user.avatar}${discord_user.avatar.startsWith('a_') ? '.gif' : '.png'}?size=256`
    : `https://cdn.discordapp.com/embed/avatars/${parseInt(discord_user.discriminator || '0') % 5}.png`;

  const bannerUrl = discord_user.banner
    ? `https://cdn.discordapp.com/banners/${discord_user.id}/${discord_user.banner}${discord_user.banner.startsWith('a_') ? '.gif' : '.png'}?size=600`
    : null;

  const bannerColor = discord_user.banner_color || '#1a0a1e';

  const getSocialLinks = (plat) => {
    const raw = customSettings?.[plat];
    if (!raw) return [];
    try {
      return typeof raw === 'string' && raw.startsWith('[') ? JSON.parse(raw) : (Array.isArray(raw) ? raw : [{ url: raw, title: 'Main' }]);
    } catch { return []; }
  };

  const handleSocialClick = (e, platform, links) => {
    if (links && links.length > 1) {
      e.preventDefault();
      setModalData({ platform, links });
    }
  };

  const gameImageUrl = gamingActivity?.assets?.large_image && gamingActivity?.application_id
    ? `https://cdn.discordapp.com/app-assets/${gamingActivity.application_id}/${gamingActivity.assets.large_image}.png`
    : null;

  return (
    <>
      <motion.div
        className="dcard"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        style={{ '--status-color': statusColor }}
      >
        {/* Banner */}
        <div className="dcard__banner" style={{ background: bannerUrl ? 'transparent' : `linear-gradient(135deg, ${bannerColor} 0%, #1e0a2a 50%, #0d050f 100%)` }}>
          {bannerUrl && <img src={bannerUrl} alt="" className="dcard__banner-img" onError={(e) => { e.target.style.display = 'none'; }} />}
          <div className="dcard__banner-shimmer" />
        </div>

        {/* Avatar Section */}
        <div className="dcard__avatar-row">
          <div className="dcard__avatar-wrap">
            <div className="dcard__avatar-ring" style={{ '--ring-color': statusColor }} />
            <img src={avatarUrl} alt={discord_user.username} className="dcard__avatar" />
            {discord_user.avatar_decoration_data?.asset && (
              <img
                src={`https://cdn.discordapp.com/avatar-decoration-presets/${discord_user.avatar_decoration_data.asset}.png`}
                alt=""
                className="dcard__decoration"
              />
            )}
            <div className="dcard__status-dot" style={{ background: statusColor }}>
              <div className="dcard__status-dot-pulse" style={{ background: statusColor }} />
            </div>
          </div>
          <div className="dcard__status-badge" style={{ color: statusColor }}>
            <div className="dcard__status-badge-dot" style={{ background: statusColor }} />
            {statusLabel}
          </div>
        </div>

        {/* Body */}
        <div className="dcard__body">

          {/* Identity */}
          <div className="dcard__identity">
            <h3 className="dcard__display-name">{discord_user.global_name || discord_user.username}</h3>
            <p className="dcard__username">@{discord_user.username}</p>
          </div>

          {/* Custom Status */}
          {customStatus?.state && (
            <div className="dcard__custom-status">
              {customStatus.emoji && (
                <img
                  src={customStatus.emoji.id
                    ? `https://cdn.discordapp.com/emojis/${customStatus.emoji.id}.${customStatus.emoji.animated ? 'gif' : 'png'}`
                    : `https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/${customStatus.emoji.name.codePointAt(0).toString(16)}.png`}
                  alt=""
                  className="dcard__custom-status-emoji"
                />
              )}
              <span className="dcard__custom-status-text">{customStatus.state}</span>
            </div>
          )}

          <div className="dcard__divider" />

          {/* About Me */}
          <div className="dcard__section">
            <h4 className="dcard__section-title">ABOUT ME</h4>
            <p className="dcard__bio">
              {customSettings?.discord_bio || discord_user.bio || "Crafting digital experiences and exploring the future of tech."}
            </p>

            {/* Social Links */}
            <div className="dcard__socials">
              {['instagram', 'twitter', 'youtube', 'github'].map(plat => {
                const links = getSocialLinks(plat);
                if (!links.length || !links[0].url) return null;
                const Icon = SocialIcons[plat];
                return (
                  <motion.a
                    key={plat}
                    href={links[0].url}
                    onClick={(e) => handleSocialClick(e, plat.charAt(0).toUpperCase() + plat.slice(1), links)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="dcard__social-icon"
                    whileHover={{ scale: 1.2, y: -2 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  >
                    <Icon />
                  </motion.a>
                );
              })}
            </div>
          </div>

          {/* Activity */}
          <AnimatePresence mode="wait">
            {listening_to_spotify && spotify ? (
              <motion.div key="spotify" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <div className="dcard__divider" />
                <div className="dcard__section">
                  <h4 className="dcard__section-title">
                    <Music size={11} style={{ marginRight: 5 }} />
                    LISTENING TO SPOTIFY
                  </h4>
                  <div className="dcard__spotify">
                    {spotify.album_art_url && (
                      <div className="dcard__album-wrap">
                        <img src={spotify.album_art_url} alt={spotify.album} className="dcard__album-art" />
                        <div className="dcard__album-spin" />
                      </div>
                    )}
                    <div className="dcard__spotify-info">
                      <p className="dcard__track">{spotify.track}</p>
                      <p className="dcard__artist">by {spotify.artist}</p>
                      <p className="dcard__album-name">on {spotify.album}</p>
                      <div className="dcard__progress-wrap">
                        <div className="dcard__progress-bar">
                          <motion.div
                            className="dcard__progress-fill"
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1, ease: 'linear' }}
                          />
                          <div className="dcard__progress-thumb" style={{ left: `${progress}%` }} />
                        </div>
                        <div className="dcard__progress-times">
                          <span>{elapsed}</span>
                          <span>{duration}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : gamingActivity ? (
              <motion.div key="gaming" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                <div className="dcard__divider" />
                <div className="dcard__section">
                  <h4 className="dcard__section-title">
                    <Gamepad2 size={11} style={{ marginRight: 5 }} />
                    PLAYING A GAME
                  </h4>
                  <div className="dcard__gaming">
                    {gameImageUrl && (
                      <img src={gameImageUrl} alt={gamingActivity.name} className="dcard__game-art" onError={(e) => e.target.style.display = 'none'} />
                    )}
                    <div className="dcard__gaming-info">
                      <p className="dcard__game-name">{gamingActivity.name}</p>
                      {gamingActivity.details && <p className="dcard__game-detail">{gamingActivity.details}</p>}
                      {gamingActivity.state && <p className="dcard__game-state">{gamingActivity.state}</p>}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Profile Link */}
          <motion.a
            href={`https://discord.com/users/${discord_user.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="dcard__link"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>View Discord Profile</span>
            <ExternalLink size={13} />
          </motion.a>
        </div>
      </motion.div>

      {/* Social Modal */}
      <AnimatePresence>
        {modalData && (
          <motion.div className="social-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setModalData(null)} style={{ zIndex: 300 }}>
            <motion.div className="social-modal" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} onClick={e => e.stopPropagation()}>
              <h3 className="social-modal__title">Choose <span className="text-accent">{modalData.platform}</span></h3>
              <div className="social-modal__list">
                {modalData.links.map((link, idx) => (
                  <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="social-modal__item">
                    <span>{link.title || 'Visit Profile'}</span>
                    <ChevronDown size={18} style={{ transform: 'rotate(-90deg)' }} className="social-modal__icon" />
                  </a>
                ))}
              </div>
              <button className="btn btn--outline btn--full" style={{ marginTop: '20px' }} onClick={() => setModalData(null)}>Cancel</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
