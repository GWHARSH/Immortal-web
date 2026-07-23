import { useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Calendar, Eye, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { forceHttps } from '../utils/security';

const getYoutubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

export default function UploadCard({ upload, index = 0 }) {
  const isMobile = typeof window !== 'undefined' && (window.innerWidth <= 768 || 'ontouchstart' in window);
  const ytId = getYoutubeId(upload.youtube_url);
  const imageUrl =
    forceHttps(upload.thumbnail) ||
    (ytId
      ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`
      : `https://picsum.photos/seed/${upload.id}/600/400`);

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
      to={`/uploads/${upload.slug || upload.id}`}
      className="card tilt-card"
      style={{ display: 'block', textDecoration: 'none' }}
    >
      <div className="card__image-wrap">
        <img
          src={imageUrl}
          alt={upload.title}
          className="card__image"
          loading="lazy"
          decoding="async"
        />
        <div className="card__category-badge">{upload.category || 'General'}</div>
        <div className="card__overlay-icon">
          <ArrowUpRight size={20} />
        </div>
        {!isMobile && <div className="card__shine" />}
      </div>
      <div className="card__body">
        <h3 className="card__title">{upload.title}</h3>
        <p className="card__desc">{upload.description}</p>
        <div className="card__meta">
          <span>
            <Calendar size={14} /> {new Date(upload.created_at || Date.now()).toLocaleDateString()}
          </span>
          {upload.views !== undefined && (
            <span>
              <Eye size={14} /> {upload.views}
            </span>
          )}
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
