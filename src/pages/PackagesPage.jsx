import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import { supabase } from '../lib/supabase';
import PackageCard from '../components/PackageCard';
import PremiumLoader from '../components/PremiumLoader';

const DEMO_PACKAGES = [];

export default function PackagesPage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState(['All']);

  useEffect(() => {
    async function fetchAll() {
      try {
        const { data, error } = await supabase
          .from('packages')
          .select('*')
          .order('created_at', { ascending: false });

        if (error || !data || data.length === 0) {
          setPackages(DEMO_PACKAGES);
          extractCategories(DEMO_PACKAGES);
        } else {
          setPackages(data);
          extractCategories(data);
        }
      } catch {
        setPackages(DEMO_PACKAGES);
        extractCategories(DEMO_PACKAGES);
      }
      setLoading(false);
    }
    fetchAll();
  }, []);

  function extractCategories(data) {
    const cats = ['All', ...new Set(data.map((p) => p.category).filter(Boolean))];
    setCategories(cats);
  }

  const filtered = packages.filter((p) => {
    const matchCat = activeCategory === 'All' || p.category === activeCategory;
    const matchSearch =
      !searchTerm ||
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchTerm.toLowerCase());
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
          All <span className="text-accent">Packages</span>
        </motion.h1>
        <motion.p
          className="page__subtitle"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Premium services designed to elevate your brand.
        </motion.p>
      </div>

      <div className="page__controls">
        <div className="search-bar">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search packages..."
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
        <PremiumLoader text="Fetching Packages..." />
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <p>No packages found matching your criteria.</p>
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
            {filtered.map((pkg, i) => (
              <PackageCard key={pkg.id} pkg={pkg} index={i} />
            ))}
          </motion.div>
        </AnimatePresence>
      )}
    </main>
  );
}
