import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Star, Zap, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { forceHttps } from '../utils/security';

export default function PackageCard({ pkg, index = 0 }) {
  const isMobile = typeof window !== 'undefined' && (window.innerWidth <= 768 || 'ontouchstart' in window);

  // 3D Tilt calculation (desktop fine pointer only)
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [12, -12]), {
    stiffness: 400,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-12, 12]), {
    stiffness: 400,
    damping: 30,
  });

  const handleMouseMove = (e) => {
    if (isMobile) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    x.set(0);
    y.set(0);
  };

  const content = (
    <Link
      to={`/packages/${pkg.slug || pkg.id}`}
      className="card card--package tilt-card"
      style={{ display: 'block', textDecoration: 'none' }}
    >
      <div className="card__image-wrap">
        <img
          src={forceHttps(pkg.thumbnail) || `https://picsum.photos/seed/pkg${pkg.id}/600/400`}
          alt={pkg.title}
          className="card__image"
          loading="lazy"
          decoding="async"
        />
        <div className="card__category-badge card__category-badge--pkg">
          {pkg.category || 'Standard'}
        </div>
        <div className="card__overlay-icon">
          <ArrowUpRight size={20} />
        </div>
        {!isMobile && <div className="card__shine" />}
      </div>
      <div className="card__body">
        <h3 className="card__title">{pkg.title}</h3>
        <p className="card__desc">{pkg.description}</p>
        <div className="card__meta">
          {pkg.rating && (
            <span className="card__rating">
              <Star size={14} fill="currentColor" /> {pkg.rating}
            </span>
          )}
          <span>
            <Zap size={14} /> {pkg.category || 'Standard'}
          </span>
        </div>
      </div>
    </Link>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.4, delay: isMobile ? 0 : index * 0.05 }}
      style={isMobile ? undefined : { perspective: 1000 }}
    >
      {isMobile ? (
        content
      ) : (
        <motion.div
          style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {content}
        </motion.div>
      )}
    </motion.div>
  );
}
