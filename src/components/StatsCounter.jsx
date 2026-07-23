import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Award, Eye, Download, Users, Zap, ShieldCheck } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const DEFAULT_STATS = [
  { id: 1, label: 'Projects Completed', value: 75, suffix: '+', color: '#00F0FF' },
  { id: 2, label: 'Total Impressions', value: 250, suffix: 'K+', color: '#38BDF8' },
  { id: 3, label: 'Packages Delivered', value: 120, suffix: '+', color: '#3B82F6' },
  { id: 4, label: 'Community Members', value: 15, suffix: 'K+', color: '#60A5FA' },
];

const ICON_MAP = [Award, Eye, Download, Users, Zap, ShieldCheck];

function CounterNumber({ target, suffix }) {
  const isMobile = typeof window !== 'undefined' && (window.innerWidth <= 768 || 'ontouchstart' in window);
  const numTarget = Number(target) || 0;
  const [count, setCount] = useState(isMobile ? numTarget : 0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-20px' });

  useEffect(() => {
    if (isMobile || !isInView) return;
    let start = 0;
    const duration = 1200;
    const stepTime = 60;
    const steps = duration / stepTime;
    const increment = numTarget / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= numTarget) {
        setCount(numTarget);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [isInView, target, isMobile, numTarget]);

  return (
    <span ref={ref} className="stats-card__number">
      {isMobile ? numTarget : count}
      {suffix}
    </span>
  );
}

export default function StatsCounter() {
  const { settings } = useSettings();

  const getStats = () => {
    if (!settings?.stats_data) return DEFAULT_STATS;
    try {
      const parsed = typeof settings.stats_data === 'string'
        ? JSON.parse(settings.stats_data)
        : settings.stats_data;
      return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_STATS;
    } catch {
      return DEFAULT_STATS;
    }
  };

  const stats = getStats();

  return (
    <section className="stats-section">
      <div className="stats-section__inner">
        <div className="stats-grid">
          {stats.map((stat, i) => {
            const IconComponent = ICON_MAP[i % ICON_MAP.length];
            return (
              <motion.div
                key={stat.id || i}
                className="stats-card"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -6, scale: 1.02 }}
              >
                <div
                  className="stats-card__icon-wrap"
                  style={{ '--icon-glow': stat.color || '#00F0FF' }}
                >
                  <IconComponent size={24} />
                </div>
                <div className="stats-card__content">
                  <CounterNumber target={stat.value} suffix={stat.suffix || ''} />
                  <span className="stats-card__label">{stat.label}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
