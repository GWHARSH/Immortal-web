import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, ChevronLeft, ChevronRight, Globe, Sparkles, Rotate3d, X, Eye } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { forceHttps } from '../utils/security';

const DEFAULT_WEBSITES = [
  {
    id: 1,
    title: 'Apex Esports Portal',
    category: 'Full-Stack Web App',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
    url: 'https://example.com',
    description: 'A high-performance tournament management platform with live stream integration and real-time brackets.',
    tags: ['React', 'Supabase', 'Vite', 'Tailwind'],
  },
  {
    id: 2,
    title: 'Vortex Motion Studio',
    category: 'Agency Landing Page',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
    url: 'https://example.com',
    description: 'Sleek dark-mode portfolio website crafted for a 3D animation studio featuring smooth WebGL transitions.',
    tags: ['Three.js', 'Framer Motion', 'React'],
  },
  {
    id: 3,
    title: 'Cyberpunk Asset Market',
    category: 'E-Commerce Showcase',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
    url: 'https://example.com',
    description: 'Digital goods storefront for 3D creators, VFX packs, and LUT presets with instant Supabase delivery.',
    tags: ['Next.js', 'Stripe', 'Supabase'],
  },
  {
    id: 4,
    title: 'Aetheria AI Engine',
    category: 'AI Platform',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    url: 'https://example.com',
    description: 'Generative AI suite for automated 3D asset creation and real-time prompt rendering.',
    tags: ['Python', 'WebSockets', 'React'],
  },
  {
    id: 5,
    title: 'Chronos Financial Analytics',
    category: 'Fintech Dashboard',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    url: 'https://example.com',
    description: 'Real-time telemetry and financial market monitoring interface with high-frequency updates.',
    tags: ['TypeScript', 'D3.js', 'Tailwind'],
  },
  {
    id: 6,
    title: 'Nebula Cloud Systems',
    category: 'SaaS Infrastructure',
    image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    url: 'https://example.com',
    description: 'Distributed cloud computing engine with zero-trust network encryption and live nodes monitoring.',
    tags: ['Go', 'Docker', 'Kubernetes'],
  },
];

export default function WebsitesShowcase() {
  const { settings } = useSettings();
  const isMobile = typeof window !== 'undefined' && (window.innerWidth <= 768 || 'ontouchstart' in window);
  const [viewMode, setViewMode] = useState(() => (isMobile ? 'classic' : '3d')); // '3d' | 'classic'
  const [selectedSite, setSelectedSite] = useState(null);
  const [current, setCurrent] = useState(0);

  // 3D Swirl Helix State
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollPosRef = useRef(0);
  const scrollTargetRef = useRef(0);
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const pointerStartPosRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const animFrameRef = useRef(null);
  const isHoveredRef = useRef(false);

  const getWebsites = () => {
    if (!settings?.websites_data) return DEFAULT_WEBSITES;
    try {
      const parsed = typeof settings.websites_data === 'string'
        ? JSON.parse(settings.websites_data)
        : settings.websites_data;
      return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_WEBSITES;
    } catch {
      return DEFAULT_WEBSITES;
    }
  };

  const websites = getWebsites();

  // Smooth Physics Scroll Loop for 3D Swirl — only run when viewMode === '3d'
  useEffect(() => {
    if (viewMode !== '3d') return;

    let lastTime = performance.now();

    const loop = (now) => {
      const delta = now - lastTime;
      lastTime = now;

      // Auto flow down when not dragging/scrolling actively
      if (!isDraggingRef.current && !isHoveredRef.current) {
        scrollTargetRef.current += 0.25 * (delta / 16.6);
      }

      // Smooth dampening inertia interpolation
      scrollPosRef.current += (scrollTargetRef.current - scrollPosRef.current) * 0.08;
      setScrollProgress(scrollPosRef.current);

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [viewMode]);

  // Attach non-passive wheel listener for smooth scroll wheel control
  useEffect(() => {
    const container = containerRef.current;
    if (!container || viewMode !== '3d') return;

    const onWheelNative = (e) => {
      e.preventDefault();
      scrollTargetRef.current += e.deltaY * 0.55;
    };

    container.addEventListener('wheel', onWheelNative, { passive: false });
    return () => container.removeEventListener('wheel', onWheelNative);
  }, [viewMode]);

  // Touch / Mouse Drag handlers for 3D Swirl
  const handlePointerDown = (e) => {
    isDraggingRef.current = true;
    const clientX = e.clientX || (e.touches && e.touches[0].clientX) || 0;
    const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    startYRef.current = clientY;
    pointerStartPosRef.current = { x: clientX, y: clientY };
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    const clientY = e.clientY || (e.touches && e.touches[0].clientY) || 0;
    const diff = startYRef.current - clientY;
    startYRef.current = clientY;
    scrollTargetRef.current += diff * 1.5;
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  // Dedicated Card Click Handler that discriminates true clicks from drag gestures
  const handleCardClick = (e, site) => {
    e.stopPropagation();
    const clientX = e.clientX || (e.changedTouches && e.changedTouches[0].clientX) || 0;
    const clientY = e.clientY || (e.changedTouches && e.changedTouches[0].clientY) || 0;
    const dx = clientX - pointerStartPosRef.current.x;
    const dy = clientY - pointerStartPosRef.current.y;
    const dist = Math.hypot(dx, dy);

    // If mouse moved less than 10px, treat as an intentional click!
    if (dist < 10) {
      setSelectedSite(site);
    }
  };

  const nextSlide = () => setCurrent((prev) => (prev + 1) % websites.length);
  const prevSlide = () => setCurrent((prev) => (prev - 1 + websites.length) % websites.length);

  const activeSite = websites[current] || websites[0];

  return (
    <section className="websites-section" id="websites-showcase">
      <div className="websites-section__inner">
        {/* Section Header */}
        <motion.div
          className="section-preview__header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="section-label">
            <Rotate3d size={13} style={{ marginRight: 6 }} /> Web Creation
          </span>
          <h2 className="section-title">
            Websites & <span className="text-accent">Projects</span>
          </h2>
          <p className="section-subtitle">
            Scroll mouse wheel to swirl project pages floating seamlessly from top to bottom. Click any page to view.
          </p>

          {/* View Mode Switcher */}
          <div className="swirl-view-switcher">
            <button
              className={`swirl-switcher__btn ${viewMode === '3d' ? 'swirl-switcher__btn--active' : ''}`}
              onClick={() => setViewMode('3d')}
            >
              <Rotate3d size={14} /> 3D Swirl Flow
            </button>
            <button
              className={`swirl-switcher__btn ${viewMode === 'classic' ? 'swirl-switcher__btn--active' : ''}`}
              onClick={() => setViewMode('classic')}
            >
              <Globe size={14} /> Browser Frame
            </button>
          </div>
        </motion.div>

        {/* ── 3D HELICAL SWIRL FLOW VIEW (Top-to-Bottom Trajectory) ── */}
        {viewMode === '3d' && (
          <div
            ref={containerRef}
            className="swirl-3d-stage"
            onMouseEnter={() => { isHoveredRef.current = true; }}
            onMouseLeave={() => { isHoveredRef.current = false; handlePointerUp(); }}
            onMouseDown={handlePointerDown}
            onMouseMove={handlePointerMove}
            onMouseUp={handlePointerUp}
            onTouchStart={handlePointerDown}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerUp}
          >
            {/* 3D Swirling Cards Container */}
            <div className="swirl-3d__space">
              {websites.map((site, index) => {
                const total = websites.length;
                const verticalSpacing = 160;
                const totalHeight = total * verticalSpacing;

                // Calculate continuous top-to-bottom Y position
                let rawY = ((index * verticalSpacing + scrollProgress * 1.2) % totalHeight);
                if (rawY < 0) rawY += totalHeight;

                // Map to [-totalHeight/2, totalHeight/2] stage space
                let y = rawY - (totalHeight / 2);

                // Calculate 3D helical S-curve x & z path
                const normalizedY = y / (totalHeight / 2); // -1 (top) to +1 (bottom)
                const swirlAngle = normalizedY * Math.PI * 1.4 + (scrollProgress * 0.002);

                const radiusX = 260; // horizontal arc offset
                const radiusZ = 180; // depth offset

                const x = Math.sin(swirlAngle) * radiusX;
                const z = Math.cos(swirlAngle) * radiusZ;

                // Edge opacity fade out at top (-240px) and bottom (+240px)
                const fadeDist = 250;
                const distFromCenter = Math.abs(y);
                let edgeOpacity = 1;
                if (distFromCenter > 130) {
                  edgeOpacity = Math.max(0, 1 - (distFromCenter - 130) / (fadeDist - 130));
                }

                // Front-facing readable camera angles
                const rotY = Math.sin(swirlAngle) * 22;
                const rotZ = Math.sin(swirlAngle) * -6;
                const rotX = Math.cos(swirlAngle) * 4;

                const scale = Math.max(0.55, (0.7 + (z + radiusZ) / (2 * radiusZ) * 0.35));
                const opacity = Math.max(0, edgeOpacity * (0.35 + (z + radiusZ) / (2 * radiusZ) * 0.65));
                const zIndex = Math.round(z + 500);

                return (
                  <div
                    key={site.id || index}
                    className="swirl-3d-card"
                    style={{
                      transform: `translate3d(${x}px, ${y}px, ${z}px) rotateY(${rotY}deg) rotateX(${rotX}deg) rotateZ(${rotZ}deg) scale(${scale})`,
                      opacity: opacity,
                      zIndex: zIndex,
                    }}
                    onClick={(e) => handleCardClick(e, site)}
                  >
                    {/* Compact Glass Card Image Header */}
                    <div className="swirl-card__img-wrap">
                      <img
                        src={forceHttps(site.image) || 'https://picsum.photos/seed/web/800/500'}
                        alt={site.title}
                        className="swirl-card__img"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="swirl-card__badge">
                        {site.category || 'Website'}
                      </div>
                      <div className="swirl-card__overlay-gradient" />
                    </div>

                    {/* Card Body */}
                    <div className="swirl-card__body">
                      <h3 className="swirl-card__title">{site.title}</h3>
                      <p className="swirl-card__desc">{site.description}</p>

                      {site.tags && (
                        <div className="swirl-card__tags">
                          {site.tags.slice(0, 3).map((tag, tIdx) => (
                            <span key={tIdx} className="swirl-card__tag">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="swirl-card__action">
                        <span>Click to Expand View</span>
                        <Eye size={13} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── CLASSIC BROWSER FRAME VIEW ── */}
        {viewMode === 'classic' && (
          <div className="browser-mockup">
            {/* Top Window Bar */}
            <div className="browser-mockup__bar">
              <div className="browser-mockup__dots">
                <span className="b-dot b-dot--red" />
                <span className="b-dot b-dot--yellow" />
                <span className="b-dot b-dot--green" />
              </div>
              <div className="browser-mockup__address">
                <Globe size={14} className="browser-mockup__icon" />
                <span>{activeSite.url || 'https://immortal-web.com'}</span>
              </div>
              <div className="browser-mockup__counter">
                0{current + 1} / 0{websites.length}
              </div>
            </div>

            {/* Slide Content Display */}
            <div className="browser-mockup__body">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSite.id || current}
                  className="website-slide"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="website-slide__img-wrap">
                    <img
                      src={forceHttps(activeSite.image) || 'https://picsum.photos/seed/web/1200/800'}
                      alt={activeSite.title}
                      className="website-slide__img"
                      loading="lazy"
                    />
                    <div className="website-slide__img-overlay" />
                  </div>

                  <div className="website-slide__details">
                    <span className="website-slide__category">{activeSite.category || 'Website'}</span>
                    <h3 className="website-slide__title">{activeSite.title}</h3>
                    <p className="website-slide__desc">{activeSite.description}</p>

                    {/* Tech Tags */}
                    {activeSite.tags && Array.isArray(activeSite.tags) && (
                      <div className="website-slide__tags">
                        {activeSite.tags.map((tag, idx) => (
                          <span key={idx} className="website-slide__tag">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Visit Action Button */}
                    {activeSite.url && (
                      <motion.a
                        href={activeSite.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn--primary btn--lg"
                        style={{ marginTop: '16px', display: 'inline-flex' }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span>Visit Live Website</span>
                        <ExternalLink size={18} />
                      </motion.a>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation Arrow Controls */}
              {websites.length > 1 && (
                <>
                  <button
                    className="browser-nav-btn browser-nav-btn--prev"
                    onClick={prevSlide}
                    aria-label="Previous website"
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <button
                    className="browser-nav-btn browser-nav-btn--next"
                    onClick={nextSlide}
                    aria-label="Next website"
                  >
                    <ChevronRight size={22} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Selector Strip */}
            {websites.length > 1 && (
              <div className="websites-thumbnails">
                {websites.map((site, idx) => (
                  <button
                    key={site.id || idx}
                    className={`website-thumb ${current === idx ? 'website-thumb--active' : ''}`}
                    onClick={() => setCurrent(idx)}
                  >
                    <img
                      src={forceHttps(site.image) || 'https://picsum.photos/seed/web/200/120'}
                      alt={site.title}
                    />
                    <span className="website-thumb__title">{site.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── EXPANDED PROJECT MODAL DIALOG ── */}
      <AnimatePresence>
        {selectedSite && (
          <div className="social-modal-overlay" onClick={() => setSelectedSite(null)}>
            <motion.div
              className="swirl-modal"
              initial={{ opacity: 0, scale: 0.88, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 30 }}
              transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="swirl-modal__close"
                onClick={() => setSelectedSite(null)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>

              <div className="swirl-modal__preview">
                <img
                  src={forceHttps(selectedSite.image) || 'https://picsum.photos/seed/web/1200/800'}
                  alt={selectedSite.title}
                  className="swirl-modal__img"
                />
                <span className="swirl-modal__badge">{selectedSite.category || 'Website'}</span>
              </div>

              <div className="swirl-modal__body">
                <h3 className="swirl-modal__title">{selectedSite.title}</h3>
                <p className="swirl-modal__desc">{selectedSite.description}</p>

                {selectedSite.tags && Array.isArray(selectedSite.tags) && (
                  <div className="swirl-modal__tags">
                    {selectedSite.tags.map((tag, tIdx) => (
                      <span key={tIdx} className="swirl-modal__tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {selectedSite.url && (
                  <motion.a
                    href={selectedSite.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn--primary btn--lg btn--full"
                    style={{ marginTop: '20px' }}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <span>Visit Live Website</span>
                    <ExternalLink size={18} />
                  </motion.a>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
