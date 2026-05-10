import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import UploadCard from '../components/UploadCard';
import PremiumLoader from '../components/PremiumLoader';

const DEMO_UPLOADS = [];

export default function UploadsPage() {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState(['All']);

  useEffect(() => {
    async function fetchAll() {
      try {
        const { data, error } = await supabase
          .from('uploads')
          .select('*')
          .order('created_at', { ascending: false });

        if (error || !data || data.length === 0) {
          setUploads(DEMO_UPLOADS);
          extractCategories(DEMO_UPLOADS);
        } else {
          setUploads(data);
          extractCategories(data);
        }
      } catch {
        setUploads(DEMO_UPLOADS);
        extractCategories(DEMO_UPLOADS);
      }
      setLoading(false);
    }
    fetchAll();
  }, []);

  function extractCategories(data) {
    const cats = ['All', ...new Set(data.map((u) => u.category).filter(Boolean))];
    setCategories(cats);
  }

  const filtered = uploads.filter((u) => {
    const matchCat = activeCategory === 'All' || u.category === activeCategory;
    const matchSearch =
      !searchTerm ||
      u.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <main className="page">
      <div className="page__hero">
        <motion.h1
          className="page__title"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          All <span className="text-accent">Uploads</span>
        </motion.h1>
        <motion.p
          className="page__subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Browse through the complete collection of work.
        </motion.p>
      </div>

      <div className="page__controls">
        <div className="search-bar">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search uploads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="category-filters">
          <Filter size={16} />
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-chip ${activeCategory === cat ? 'filter-chip--active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <PremiumLoader text="Loading Library..." />
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <p>No uploads found matching your criteria.</p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory + searchTerm}
            className="cards-grid cards-grid--full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {filtered.map((upload, i) => (
              <UploadCard key={upload.id} upload={upload} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </main>
  );
}
