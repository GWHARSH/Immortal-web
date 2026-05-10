import { motion } from 'framer-motion';
import { Star, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PackageCard({ pkg, index = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link to={`/packages/${pkg.slug || pkg.id}`} className="card card--package" style={{ display: 'block', textDecoration: 'none' }}>
        <div className="card__image-wrap">
          <img
            src={pkg.thumbnail || `https://picsum.photos/seed/pkg${pkg.id}/600/400`}
            alt={pkg.title}
            className="card__image"
            loading="lazy"
          />
          <div className="card__category-badge card__category-badge--pkg">
            {pkg.category || 'Standard'}
          </div>
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
            <span><Zap size={14} /> {pkg.category || 'Standard'}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
