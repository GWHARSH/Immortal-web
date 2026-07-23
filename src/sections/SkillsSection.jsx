import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Code, Video, Sparkles, Layers, Box, Cpu } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

const DEFAULT_SKILLS = [
  { name: 'After Effects & VFX', category: 'VFX & Editing', level: 98, desc: 'Advanced motion graphics, particle fx, and cinematic compositing' },
  { name: 'Premiere Pro', category: 'VFX & Editing', level: 95, desc: 'Dynamic pace editing, sound design integration & color grading' },
  { name: 'Blender & 3D CGI', category: '3D & Motion', level: 90, desc: 'Photorealistic lighting, fluid simulations & camera tracking' },
  { name: 'Cinema 4D & Octane', category: '3D & Motion', level: 88, desc: 'Abstract 3D art, geometry nodes, procedural materials' },
  { name: 'React & Vite', category: 'Web & Tech', level: 92, desc: 'Modern frontend development, Framer Motion animations & fast builds' },
  { name: 'Supabase & Backend', category: 'Web & Tech', level: 86, desc: 'Realtime database integration, auth security & edge functions' },
  { name: 'Photoshop & Graphics', category: 'Design', level: 96, desc: 'Thumbnails, brand identity, vector assets & typography' },
  { name: 'Audio Design & Scoring', category: 'Design', level: 90, desc: 'Sound FX layering, equalization, atmospheric soundscapes' },
];

const ICON_MAP = [Video, Layers, Box, Cpu, Code, Sparkles, Sparkles, Layers];

export default function SkillsSection() {
  const { settings } = useSettings();
  const [activeTab, setActiveTab] = useState('All');

  const getSkills = () => {
    if (!settings?.skills_data) return DEFAULT_SKILLS;
    try {
      const parsed = typeof settings.skills_data === 'string'
        ? JSON.parse(settings.skills_data)
        : settings.skills_data;
      return Array.isArray(parsed) && parsed.length ? parsed : DEFAULT_SKILLS;
    } catch {
      return DEFAULT_SKILLS;
    }
  };

  const skillsList = getSkills();
  const categories = ['All', ...new Set(skillsList.map((s) => s.category).filter(Boolean))];

  const filteredSkills = skillsList.filter(
    (skill) => activeTab === 'All' || skill.category === activeTab
  );

  return (
    <section className="skills-section" id="skills">
      <div className="skills-section__inner">
        <motion.div
          className="section-preview__header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <span className="section-label">Mastery & Tech</span>
          <h2 className="section-title">
            Skills & <span className="text-accent">Capabilities</span>
          </h2>
          <p className="section-subtitle">
            A breakdown of high-end creative, technical, and development skills.
          </p>
        </motion.div>

        {/* Category Tabs */}
        <div className="skills-tabs">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`skills-tab ${activeTab === cat ? 'skills-tab--active' : ''}`}
              onClick={() => setActiveTab(cat)}
            >
              {cat}
              {activeTab === cat && (
                <motion.div
                  layoutId="active-skill-tab"
                  className="skills-tab__indicator"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Skills Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            className="skills-grid"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
          >
            {filteredSkills.map((skill, index) => {
              const IconComponent = ICON_MAP[index % ICON_MAP.length];
              return (
                <motion.div
                  key={skill.name + index}
                  className="skill-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                >
                  <div className="skill-card__header">
                    <div className="skill-card__icon">
                      <IconComponent size={20} />
                    </div>
                    <span className="skill-card__badge">{skill.category}</span>
                  </div>
                  <h3 className="skill-card__title">{skill.name}</h3>
                  <p className="skill-card__desc">{skill.desc}</p>

                  <div className="skill-card__bar-wrap">
                    <div className="skill-card__bar-info">
                      <span>Proficiency</span>
                      <span className="skill-card__percentage">{skill.level}%</span>
                    </div>
                    <div className="skill-card__bar-track">
                      <motion.div
                        className="skill-card__bar-fill"
                        style={{ width: `${skill.level}%`, transformOrigin: 'left' }}
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
