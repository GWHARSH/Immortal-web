import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';
import { Download, Star, ArrowLeft } from 'lucide-react';
import PremiumLoader from '../components/PremiumLoader';

export default function PackageDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPackage = async () => {
      // First try to match by slug, if not found or if slug is a number, try by id
      let query = supabase.from('packages').select('*');
      
      const isNumeric = /^\d+$/.test(slug);
      
      if (!isNumeric) {
        query = query.eq('slug', slug);
      } else {
        query = query.eq('id', slug);
      }
      
      const { data, error } = await query.single();
      
      if (!error && data) {
        setPkg(data);
      } else if (!isNumeric) {
        // Fallback: maybe it's an ID that happens to look like a string?
        const { data: fallbackData } = await supabase.from('packages').select('*').eq('id', slug).single();
        if (fallbackData) setPkg(fallbackData);
      }
      setLoading(false);
    };

    fetchPackage();
  }, [slug]);

  if (loading) return (
    <div className="page" style={{ justifyContent: 'center' }}>
      <PremiumLoader text="Loading Package Info" />
    </div>
  );
  if (!pkg) return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Package not found.</div>;

  return (
    <main className="page" style={{ paddingTop: '100px' }}>
      <div className="section-preview__inner">
        <button className="btn btn--outline" style={{ marginBottom: '24px' }} onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {pkg.download_url && pkg.download_url.toLowerCase().endsWith('.mp4') ? (
            <div style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: '32px', border: '1px solid var(--border-glass)', background: '#000' }}>
               <video 
                src={pkg.download_url} 
                controls 
                playsInline
                style={{ width: '100%', display: 'block', maxHeight: '70vh' }} 
                poster={pkg.thumbnail}
              />
            </div>
          ) : (
            <img 
              src={pkg.thumbnail || `https://picsum.photos/seed/pkg${pkg.id}/1200/600`} 
              alt={pkg.title} 
              className="details__image"
            />
          )}
          
          <div className="details__header">
            <span className="section-label">{pkg.category || 'Standard Package'}</span>
            <h1 className="details__title">{pkg.title}</h1>
            {pkg.rating && (
              <div className="details__rating">
                <Star size={18} fill="currentColor" />
                <span>{pkg.rating} Rating</span>
              </div>
            )}
          </div>
            
            {pkg.download_url && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginTop: '24px' }}>
                <a href={pkg.download_url} target="_blank" rel="noreferrer" className="btn btn--primary btn--lg">
                  <Download size={20} /> Download Package
                </a>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {pkg.download_url.includes('supabase') 
                    ? pkg.download_url.split('/').pop().split('-').slice(0, -1).join('-') || 'Package File'
                    : 'External Download'}
                </span>
              </div>
            )}

          
          <div style={{ marginTop: '40px', background: 'var(--bg-card)', padding: '32px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-glass)' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '16px', fontFamily: "'Outfit', sans-serif" }}>Description</h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
              {pkg.description}
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
