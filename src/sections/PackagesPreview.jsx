import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import PackageCard from '../components/PackageCard';
import PremiumLoader from '../components/PremiumLoader';

const DEMO_PACKAGES = [];

export default function PackagesPreview() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPackages() {
      try {
        const { data, error } = await supabase
          .from('packages')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);

        if (error || !data || data.length === 0) {
          setPackages(DEMO_PACKAGES);
        } else {
          setPackages(data);
        }
      } catch {
        setPackages(DEMO_PACKAGES);
      }
      setLoading(false);
    }
    fetchPackages();
  }, []);

  return (
    <section className="section-preview section-preview--alt" id="packages">
      <div className="section-preview__inner">
        <motion.div
          className="section-preview__header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-label">Packages</span>
          <h2 className="section-title">Featured <span className="text-accent">Packages</span></h2>
          <p className="section-subtitle">Premium services tailored to your needs.</p>
        </motion.div>

        {loading ? (
          <PremiumLoader text="Preparing Packages..." />
        ) : (
          <div className="cards-grid">
            {packages.map((pkg, i) => (
              <PackageCard key={pkg.id} pkg={pkg} index={i} />
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
          <Link to="/packages" className="btn btn--primary btn--lg">
            Show More <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
