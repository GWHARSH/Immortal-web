import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import UploadCard from '../components/UploadCard';
import PremiumLoader from '../components/PremiumLoader';

const DEMO_UPLOADS = [];

export default function UploadsPreview() {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUploads() {
      try {
        const { data, error } = await supabase
          .from('uploads')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);

        if (error || !data || data.length === 0) {
          setUploads(DEMO_UPLOADS);
        } else {
          setUploads(data);
        }
      } catch {
        setUploads(DEMO_UPLOADS);
      }
      setLoading(false);
    }
    fetchUploads();
  }, []);

  return (
    <section className="section-preview" id="uploads">
      <div className="section-preview__inner">
        <motion.div
          className="section-preview__header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-label">Uploads</span>
          <h2 className="section-title">Latest <span className="text-accent">Uploads</span></h2>
          <p className="section-subtitle">Check out the newest additions to the portfolio.</p>
        </motion.div>

        {loading ? (
          <PremiumLoader text="Fetching Uploads..." />
        ) : (
          <div className="cards-grid">
            {uploads.map((upload, i) => (
              <UploadCard key={upload.id} upload={upload} index={i} />
            ))}
          </div>
        )}

        <motion.div
          className="section-preview__cta"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Link to="/uploads" className="btn btn--primary btn--lg">
            Show More <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
