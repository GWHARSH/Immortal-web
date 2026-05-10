import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Eye, Play } from 'lucide-react';
import PremiumLoader from '../components/PremiumLoader';

const getYoutubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export default function UploadDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [upload, setUpload] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpload = async () => {
      let query = supabase.from('uploads').select('*');
      const isNumeric = /^\d+$/.test(slug);
      
      if (!isNumeric) {
        query = query.eq('slug', slug);
      } else {
        query = query.eq('id', slug);
      }
      
      const { data, error } = await query.single();
      
      if (!error && data) {
        setUpload(data);
        // Increment view count
        supabase.from('uploads').update({ views: (data.views || 0) + 1 }).eq('id', data.id).then();
      } else if (!isNumeric) {
        const { data: fallbackData } = await supabase.from('uploads').select('*').eq('id', slug).single();
        if (fallbackData) {
          setUpload(fallbackData);
          supabase.from('uploads').update({ views: (fallbackData.views || 0) + 1 }).eq('id', fallbackData.id).then();
        }
      }
      setLoading(false);
    };

    fetchUpload();
  }, [slug]);

  if (loading) return (
    <div className="page" style={{ justifyContent: 'center' }}>
      <PremiumLoader text="Preparing Showcase" />
    </div>
  );
  if (!upload) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Upload not found.</div>;

  const ytId = getYoutubeId(upload.youtube_url);
  const isMp4 = upload.download_url && upload.download_url.toLowerCase().endsWith('.mp4');
  const imageUrl = upload.thumbnail || (ytId ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg` : `https://picsum.photos/seed/${upload.id}/1200/600`);

  return (
    <main className="page" style={{ paddingTop: '100px' }}>
      <div className="section-preview__inner">
        <button className="btn btn--outline" style={{ marginBottom: '24px' }} onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {ytId ? (
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 'var(--radius-lg)', marginBottom: '32px' }}>
              <iframe 
                src={`https://www.youtube.com/embed/${ytId}`} 
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
                title="YouTube Video"
              />
            </div>
          ) : isMp4 ? (
            <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '32px', border: '1px solid var(--border-glass)', background: '#000' }}>
               <video 
                src={upload.download_url} 
                controls 
                playsInline
                style={{ width: '100%', display: 'block', maxHeight: '70vh' }} 
                poster={upload.thumbnail}
              />
            </div>
          ) : (
            <img 
              src={imageUrl} 
              alt={upload.title} 
              className="details__image"
            />
          )}
          
          <div className="details__header">
            <span className="section-label">{upload.category || 'General'}</span>
            <h1 className="details__title">{upload.title}</h1>
            
            <div className="details__meta">
              <span><Calendar size={16} /> {new Date(upload.created_at).toLocaleDateString()}</span>
              <span><Eye size={16} /> {upload.views || 0} Views</span>
            </div>
          </div>
          
          <div style={{ marginTop: '40px', background: 'var(--bg-card)', padding: '32px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-glass)' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', fontFamily: "'Outfit', sans-serif" }}>About this project</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
              {upload.description}
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
