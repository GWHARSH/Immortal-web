import { motion } from 'framer-motion';
import { Calendar, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

const getYoutubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export default function UploadCard({ upload, index = 0 }) {
  const ytId = getYoutubeId(upload.youtube_url);
  const imageUrl = upload.thumbnail || (ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : `https://picsum.photos/seed/${upload.id}/600/400`);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link to={`/uploads/${upload.slug || upload.id}`} className="card" style={{ display: 'block', textDecoration: 'none' }}>
        <div className="card__image-wrap">
          <img
            src={imageUrl}
            alt={upload.title}
            className="card__image"
            loading="lazy"
          />
          <div className="card__category-badge">{upload.category || 'General'}</div>
        </div>
        <div className="card__body">
          <h3 className="card__title">{upload.title}</h3>
          <p className="card__desc">{upload.description}</p>
          <div className="card__meta">
            <span><Calendar size={14} /> {new Date(upload.created_at).toLocaleDateString()}</span>
            {upload.views !== undefined && (
              <span><Eye size={14} /> {upload.views}</span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
