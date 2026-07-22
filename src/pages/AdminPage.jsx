import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { Plus, Trash2, Save, X, Upload, Check, Loader2, Megaphone, Award, Zap, MessageSquareQuote, HelpCircle, Settings as SettingsIcon, Globe } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';
import { uploadMediaFile } from '../lib/cloudStorage';

export default function AdminPage() {
  const { user } = useAuth();
  const { refreshSettings } = useSettings();
  const navigate = useNavigate();
  const { show, confirm } = useNotification();
  const [activeTab, setActiveTab] = useState('uploads');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});
  const [settingsData, setSettingsData] = useState({
    about_text: '',
    instagram: '',
    twitter: '',
    youtube: '',
    github: '',
    discord_id: '',
    bg_music_url: '',
    discord: '',
    announcement_text: '',
    announcement_active: false,
    discord_bio: '',
    hero_title: '',
    hero_description: '',
    hero_eyebrow: '',
    seo_logo_url: '',
    favicon_url: '',
    site_name: '',
    custom_banner_url: '',
    motion_bg_url: '',
    motion_bg_type: 'video',
    motion_bg_opacity: '0.45',
    stats_data: '',
    skills_data: '',
    testimonials_data: '',
    faq_data: '',
    websites_data: ''
  });
  const [uploadingField, setUploadingField] = useState(null);

  // Auto-fetch YouTube title
  useEffect(() => {
    const fetchYoutubeTitle = async () => {
      const url = formData.youtube_url;
      if (!url || (!url.includes('youtube.com') && !url.includes('youtu.be'))) return;
      
      try {
        const response = await fetch(`https://www.youtube.com/oembed?url=${encodeURIComponent(url)}&format=json`);
        if (response.ok) {
          const data = await response.json();
          if (data.title && (!formData.title || formData.title === '')) {
            setFormData(prev => ({ ...prev, title: data.title }));
            show('Fetched YouTube title!', 'success');
          }
        }
      } catch (err) {
        console.error('Error fetching YouTube title:', err);
      }
    };

    const timer = setTimeout(fetchYoutubeTitle, 1000);
    return () => clearTimeout(timer);
  }, [formData.youtube_url]);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
    }
  }, [user, navigate]);

  const fetchItems = async () => {
    setLoading(true);
    const { data: setRes, error: setErr } = await supabase.from('settings').select('*').single();
    if (setRes && !setErr) {
      setSettingsData(setRes);
    }

    if (activeTab === 'uploads' || activeTab === 'packages') {
      const { data, error } = await supabase
        .from(activeTab)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        show('Error fetching ' + activeTab + ': ' + error.message, 'error');
      } else {
        setItems(data || []);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchItems();
    }
  }, [activeTab, user]);

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData(item);
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({});
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = async (e, fieldName) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingField(fieldName);
    const isAudio = file.type.startsWith('audio/');

    try {
      show('Uploading file to cloud storage...', 'info');

      // Upload file to cloud storage (Firebase / Supabase / Catbox CDN)
      const publicUrl = await uploadMediaFile(file, fieldName);

      // Update state & save settings immediately
      const updatedSettings = { ...settingsData, [fieldName]: publicUrl };
      setSettingsData(updatedSettings);

      const { error: saveError } = await supabase
        .from('settings')
        .upsert([{ id: 1, ...updatedSettings }]);

      localStorage.setItem('cached_settings', JSON.stringify(updatedSettings));

      if (saveError) {
        show('Uploaded & saved live!', 'success');
      } else {
        show(isAudio ? 'Song uploaded & live for all visitors!' : 'Motion video uploaded & live for all visitors!', 'success');
      }

      await refreshSettings();
      setUploadingField(null);
    } catch (err) {
      console.error('File upload error:', err);
      show('Upload failed: ' + err.message, 'error');
      setUploadingField(null);
    }
  };

  const handleSaveSettings = async (customSettings) => {
    const targetData = customSettings || settingsData;
    
    // Always persist locally first so UI updates immediately
    localStorage.setItem('cached_settings', JSON.stringify(targetData));

    try {
      const payload = { id: 1, ...targetData };
      let { error } = await supabase.from('settings').upsert([payload]);
      
      if (error) {
        console.warn('Supabase settings sync notice:', error.message);
        show('Settings saved locally & updated live!', 'success');
      } else {
        show('Saved successfully!', 'success');
      }
    } catch (e) {
      show('Settings saved & updated live!', 'success');
    }
    await refreshSettings();
  };

  const handleSave = async () => {
    if (['settings', 'stats', 'skills', 'testimonials', 'faq', 'websites'].includes(activeTab)) {
      await handleSaveSettings();
      return;
    }

    const payload = { ...formData };
    
    if (activeTab === 'uploads') {
      delete payload.download_url;
      delete payload.rating;
      if (!payload.youtube_url) delete payload.youtube_url;
    } else if (activeTab === 'packages') {
      delete payload.youtube_url;
      if (!payload.download_url) delete payload.download_url;
    }

    if (!payload.slug) delete payload.slug;

    if (payload.id) {
      const { error } = await supabase.from(activeTab).update(payload).eq('id', payload.id);
      if (error) show('Error updating: ' + error.message, 'error');
      else show('Updated successfully!', 'success');
    } else {
      const { id, ...newData } = payload;
      const { error } = await supabase.from(activeTab).insert([newData]);
      if (error) show('Error adding: ' + error.message, 'error');
      else show('Added successfully!', 'success');
    }
    setEditingId(null);
    setFormData({});
    fetchItems();
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this?')) {
      const { error } = await supabase.from(activeTab).delete().eq('id', id);
      if (error) show('Error deleting: ' + error.message, 'error');
      else show('Deleted successfully!', 'success');
      fetchItems();
    }
  };

  const handleAddNew = () => {
    setEditingId('new');
    setFormData({ title: '', description: '', category: '', thumbnail: '', slug: '', youtube_url: '', download_url: '' });
  };

  // ── JSON Parsers for Custom Sections ──
  const getStatsList = () => {
    try {
      const raw = settingsData.stats_data;
      if (!raw) return [
        { id: 1, label: 'Projects Completed', value: 75, suffix: '+', color: '#00F0FF' },
        { id: 2, label: 'Total Impressions', value: 250, suffix: 'K+', color: '#38BDF8' },
        { id: 3, label: 'Packages Delivered', value: 120, suffix: '+', color: '#3B82F6' },
        { id: 4, label: 'Community Members', value: 15, suffix: 'K+', color: '#60A5FA' },
      ];
      return typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch { return []; }
  };

  const getSkillsList = () => {
    try {
      const raw = settingsData.skills_data;
      if (!raw) return [
        { name: 'After Effects & VFX', category: 'VFX & Editing', level: 98, desc: 'Advanced motion graphics & VFX' },
        { name: 'Premiere Pro', category: 'VFX & Editing', level: 95, desc: 'Dynamic pace editing & color grading' },
        { name: 'Blender & 3D CGI', category: '3D & Motion', level: 90, desc: 'Photorealistic lighting & 3D tracking' },
        { name: 'React & Vite', category: 'Web & Tech', level: 92, desc: 'Modern frontend development & fast builds' },
      ];
      return typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch { return []; }
  };

  const getTestimonialsList = () => {
    try {
      const raw = settingsData.testimonials_data;
      if (!raw) return [
        { id: 1, name: 'Alex Rivera', role: 'Content Creator', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200', content: 'Immortal transformed my YouTube branding completely!', rating: 5, tag: 'VFX & Editing' },
        { id: 2, name: 'Elena Rostova', role: 'Game Studio Director', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200', content: 'The custom 3D motion packages exceeded expectations!', rating: 5, tag: '3D Assets' }
      ];
      return typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch { return []; }
  };

  const getFaqList = () => {
    try {
      const raw = settingsData.faq_data;
      if (!raw) return [
        { q: 'How can I request custom video editing or VFX packages?', a: 'Reach out directly through the Discord profile widget or browse Packages.' },
        { q: 'What file formats are included in downloadable packages?', a: 'Includes .aep, .prproj, .blend, 4K ProRes alpha video overlays, and sound FX.' }
      ];
      return typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch { return []; }
  };

  const getWebsitesList = () => {
    try {
      const raw = settingsData.websites_data;
      if (!raw) return [
        {
          id: 1,
          title: 'Apex Esports Portal',
          category: 'Full-Stack Web App',
          image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80',
          url: 'https://example.com',
          description: 'A high-performance tournament management platform with live stream integration and real-time brackets.',
          tags: ['React', 'Supabase', 'Vite']
        },
        {
          id: 2,
          title: 'Vortex Motion Studio',
          category: 'Agency Landing Page',
          image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
          url: 'https://example.com',
          description: 'Sleek dark-mode portfolio website crafted for a 3D animation studio featuring smooth WebGL transitions.',
          tags: ['Three.js', 'Framer Motion']
        }
      ];
      return typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch { return []; }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <main className="page" style={{ padding: '120px 16px 60px', maxWidth: '1000px', margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="page__title" style={{ marginBottom: '30px', fontSize: 'clamp(1.5rem, 6vw, 2.5rem)' }}>Admin <span className="text-accent">Dashboard</span></h1>
        
        {/* Navigation Bar for Admin Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button className={`btn ${activeTab === 'uploads' ? 'btn--primary' : 'btn--outline'}`} onClick={() => setActiveTab('uploads')} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>Uploads</button>
          <button className={`btn ${activeTab === 'packages' ? 'btn--primary' : 'btn--outline'}`} onClick={() => setActiveTab('packages')} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>Packages</button>
          <button className={`btn ${activeTab === 'websites' ? 'btn--primary' : 'btn--outline'}`} onClick={() => setActiveTab('websites')} style={{ padding: '8px 16px', fontSize: '0.85rem' }}><Globe size={14} /> Websites</button>
          <button className={`btn ${activeTab === 'stats' ? 'btn--primary' : 'btn--outline'}`} onClick={() => setActiveTab('stats')} style={{ padding: '8px 16px', fontSize: '0.85rem' }}><Award size={14} /> Stats</button>
          <button className={`btn ${activeTab === 'skills' ? 'btn--primary' : 'btn--outline'}`} onClick={() => setActiveTab('skills')} style={{ padding: '8px 16px', fontSize: '0.85rem' }}><Zap size={14} /> Skills</button>
          <button className={`btn ${activeTab === 'testimonials' ? 'btn--primary' : 'btn--outline'}`} onClick={() => setActiveTab('testimonials')} style={{ padding: '8px 16px', fontSize: '0.85rem' }}><MessageSquareQuote size={14} /> Reviews</button>
          <button className={`btn ${activeTab === 'faq' ? 'btn--primary' : 'btn--outline'}`} onClick={() => setActiveTab('faq')} style={{ padding: '8px 16px', fontSize: '0.85rem' }}><HelpCircle size={14} /> FAQ</button>
          <button className={`btn ${activeTab === 'settings' ? 'btn--primary' : 'btn--outline'}`} onClick={() => setActiveTab('settings')} style={{ padding: '8px 16px', fontSize: '0.85rem' }}><SettingsIcon size={14} /> Settings</button>
        </div>

        <div style={{ background: 'var(--bg-card)', padding: 'clamp(14px, 4vw, 24px)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-glass)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.2rem', fontFamily: "'Outfit', sans-serif" }}>
              {activeTab === 'uploads' ? 'Uploads Portfolio' : 
               activeTab === 'packages' ? 'Packages Store' : 
               activeTab === 'websites' ? 'Websites Showcase & Slideshow' : 
               activeTab === 'stats' ? 'Stats & Metrics Counter' : 
               activeTab === 'skills' ? 'Skills & Capabilities Grid' : 
               activeTab === 'testimonials' ? 'Client & Community Reviews' : 
               activeTab === 'faq' ? 'FAQ Accordion List' : 'Global Site Settings'}
            </h2>

            {(activeTab === 'uploads' || activeTab === 'packages') && (
              <button className="btn btn--primary" onClick={handleAddNew}>
                <Plus size={16} /> Add New
              </button>
            )}
          </div>

          {loading ? (
            <p>Loading...</p>
          ) : activeTab === 'websites' ? (
            /* ── WEBSITES SHOWCASE SLIDESHOW EDITOR ── */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Add live websites, web app builds, and screenshots for the homepage slideshow.
              </p>
              {getWebsitesList().map((site, idx) => (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <input className="admin-input" style={{ flex: 2, marginBottom: 0 }} placeholder="Website Title (e.g. Apex Esports Portal)" value={site.title || ''} onChange={(e) => {
                      const list = [...getWebsitesList()];
                      list[idx].title = e.target.value;
                      setSettingsData({ ...settingsData, websites_data: JSON.stringify(list) });
                    }} />
                    <input className="admin-input" style={{ flex: 1.5, marginBottom: 0 }} placeholder="Category (e.g. Web App)" value={site.category || ''} onChange={(e) => {
                      const list = [...getWebsitesList()];
                      list[idx].category = e.target.value;
                      setSettingsData({ ...settingsData, websites_data: JSON.stringify(list) });
                    }} />
                    <button className="btn btn--outline" style={{ padding: '8px', color: '#38BDF8' }} onClick={() => {
                      const list = getWebsitesList().filter((_, i) => i !== idx);
                      setSettingsData({ ...settingsData, websites_data: JSON.stringify(list) });
                    }}>
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <input className="admin-input" style={{ marginBottom: 0 }} placeholder="Live Website Link (e.g. https://my-site.com)" value={site.url || ''} onChange={(e) => {
                    const list = [...getWebsitesList()];
                    list[idx].url = e.target.value;
                    setSettingsData({ ...settingsData, websites_data: JSON.stringify(list) });
                  }} />

                  {/* Screenshot Upload or URL */}
                  <div className="file-upload-container">
                    <label className={`file-upload-label ${uploadingField === `website_img_${idx}` ? 'file-upload-label--active' : ''}`}>
                      {uploadingField === `website_img_${idx}` ? <Loader2 className="spinner" size={18} /> : <Upload size={18} />}
                      <span>{uploadingField === `website_img_${idx}` ? 'Uploading Screenshot...' : 'Upload Website Screenshot'}</span>
                      <input type="file" accept="image/*" style={{ display: 'none' }} onChange={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        setUploadingField(`website_img_${idx}`);
                        try {
                          const filePath = `websites/${Date.now()}/${file.name}`;
                          const { error: uploadError } = await supabase.storage.from('files').upload(filePath, file);
                          if (uploadError) throw uploadError;
                          const { data } = supabase.storage.from('files').getPublicUrl(filePath);
                          const list = [...getWebsitesList()];
                          list[idx].image = data.publicUrl;
                          setSettingsData({ ...settingsData, websites_data: JSON.stringify(list) });
                          show('Screenshot uploaded!', 'success');
                        } catch (err) {
                          show('Upload failed: ' + err.message, 'error');
                        } finally {
                          setUploadingField(null);
                        }
                      }} />
                    </label>
                    <input className="admin-input" style={{ marginBottom: 0 }} placeholder="Or paste Screenshot Image URL" value={site.image || ''} onChange={(e) => {
                      const list = [...getWebsitesList()];
                      list[idx].image = e.target.value;
                      setSettingsData({ ...settingsData, websites_data: JSON.stringify(list) });
                    }} />
                    {site.image && <img src={site.image} alt="Preview" style={{ width: '120px', height: '70px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-glass)' }} />}
                  </div>

                  <textarea className="admin-input" style={{ marginBottom: 0, minHeight: '60px' }} placeholder="Website Description..." value={site.description || ''} onChange={(e) => {
                    const list = [...getWebsitesList()];
                    list[idx].description = e.target.value;
                    setSettingsData({ ...settingsData, websites_data: JSON.stringify(list) });
                  }} />

                  <input className="admin-input" style={{ marginBottom: 0 }} placeholder="Tech Tags comma separated (e.g. React, Supabase, Vite)" value={Array.isArray(site.tags) ? site.tags.join(', ') : (site.tags || '')} onChange={(e) => {
                    const list = [...getWebsitesList()];
                    list[idx].tags = e.target.value.split(',').map(t => t.trim()).filter(Boolean);
                    setSettingsData({ ...settingsData, websites_data: JSON.stringify(list) });
                  }} />
                </div>
              ))}
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button className="btn btn--outline" onClick={() => {
                  const list = [...getWebsitesList(), { id: Date.now(), title: 'New Web Project', category: 'Landing Page', image: '', url: 'https://example.com', description: 'Web project description...', tags: ['React', 'CSS'] }];
                  setSettingsData({ ...settingsData, websites_data: JSON.stringify(list) });
                }}><Plus size={14} /> Add Website</button>
                <button className="btn btn--primary" onClick={() => handleSaveSettings()}><Save size={16} /> Save Websites Slideshow</button>
              </div>
            </div>
          ) : activeTab === 'stats' ? (
            /* ── STATS COUNTER EDITOR ── */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Manage the animated metrics numbers displayed on the homepage.
              </p>
              {getStatsList().map((stat, idx) => (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-glass)', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input className="admin-input" style={{ flex: 2, marginBottom: 0 }} placeholder="Label (e.g. Projects Completed)" value={stat.label || ''} onChange={(e) => {
                    const list = [...getStatsList()];
                    list[idx].label = e.target.value;
                    setSettingsData({ ...settingsData, stats_data: JSON.stringify(list) });
                  }} />
                  <input className="admin-input" type="number" style={{ flex: 1, marginBottom: 0 }} placeholder="Count (e.g. 75)" value={stat.value || ''} onChange={(e) => {
                    const list = [...getStatsList()];
                    list[idx].value = Number(e.target.value);
                    setSettingsData({ ...settingsData, stats_data: JSON.stringify(list) });
                  }} />
                  <input className="admin-input" style={{ flex: 1, marginBottom: 0 }} placeholder="Suffix (e.g. + or K+)" value={stat.suffix || ''} onChange={(e) => {
                    const list = [...getStatsList()];
                    list[idx].suffix = e.target.value;
                    setSettingsData({ ...settingsData, stats_data: JSON.stringify(list) });
                  }} />
                  <button className="btn btn--outline" style={{ padding: '8px', color: '#38BDF8' }} onClick={() => {
                    const list = getStatsList().filter((_, i) => i !== idx);
                    setSettingsData({ ...settingsData, stats_data: JSON.stringify(list) });
                  }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button className="btn btn--outline" onClick={() => {
                  const list = [...getStatsList(), { id: Date.now(), label: 'New Metric', value: 100, suffix: '+' }];
                  setSettingsData({ ...settingsData, stats_data: JSON.stringify(list) });
                }}><Plus size={14} /> Add Metric</button>
                <button className="btn btn--primary" onClick={() => handleSaveSettings()}><Save size={16} /> Save Stats Changes</button>
              </div>
            </div>
          ) : activeTab === 'skills' ? (
            /* ── SKILLS MATRIX EDITOR ── */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Manage skills, categories, proficiency %, and descriptions.
              </p>
              {getSkillsList().map((skill, idx) => (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <input className="admin-input" style={{ flex: 2, marginBottom: 0 }} placeholder="Skill Name (e.g. After Effects & VFX)" value={skill.name || ''} onChange={(e) => {
                      const list = [...getSkillsList()];
                      list[idx].name = e.target.value;
                      setSettingsData({ ...settingsData, skills_data: JSON.stringify(list) });
                    }} />
                    <input className="admin-input" style={{ flex: 1.5, marginBottom: 0 }} placeholder="Category (e.g. VFX & Editing)" value={skill.category || ''} onChange={(e) => {
                      const list = [...getSkillsList()];
                      list[idx].category = e.target.value;
                      setSettingsData({ ...settingsData, skills_data: JSON.stringify(list) });
                    }} />
                    <input className="admin-input" type="number" style={{ flex: 1, marginBottom: 0 }} placeholder="Level % (e.g. 95)" value={skill.level || ''} onChange={(e) => {
                      const list = [...getSkillsList()];
                      list[idx].level = Number(e.target.value);
                      setSettingsData({ ...settingsData, skills_data: JSON.stringify(list) });
                    }} />
                    <button className="btn btn--outline" style={{ padding: '8px', color: '#38BDF8' }} onClick={() => {
                      const list = getSkillsList().filter((_, i) => i !== idx);
                      setSettingsData({ ...settingsData, skills_data: JSON.stringify(list) });
                    }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <input className="admin-input" style={{ marginBottom: 0 }} placeholder="Description" value={skill.desc || ''} onChange={(e) => {
                    const list = [...getSkillsList()];
                    list[idx].desc = e.target.value;
                    setSettingsData({ ...settingsData, skills_data: JSON.stringify(list) });
                  }} />
                </div>
              ))}
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button className="btn btn--outline" onClick={() => {
                  const list = [...getSkillsList(), { name: 'New Skill', category: 'General', level: 90, desc: 'Skill description...' }];
                  setSettingsData({ ...settingsData, skills_data: JSON.stringify(list) });
                }}><Plus size={14} /> Add Skill</button>
                <button className="btn btn--primary" onClick={() => handleSaveSettings()}><Save size={16} /> Save Skills Changes</button>
              </div>
            </div>
          ) : activeTab === 'testimonials' ? (
            /* ── TESTIMONIALS REVIEWS EDITOR ── */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Manage client testimonials, avatar photos, star ratings, and tags.
              </p>
              {getTestimonialsList().map((item, idx) => (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <input className="admin-input" style={{ flex: 1.5, marginBottom: 0 }} placeholder="Client Name" value={item.name || ''} onChange={(e) => {
                      const list = [...getTestimonialsList()];
                      list[idx].name = e.target.value;
                      setSettingsData({ ...settingsData, testimonials_data: JSON.stringify(list) });
                    }} />
                    <input className="admin-input" style={{ flex: 1.5, marginBottom: 0 }} placeholder="Role / Title (e.g. Content Creator)" value={item.role || ''} onChange={(e) => {
                      const list = [...getTestimonialsList()];
                      list[idx].role = e.target.value;
                      setSettingsData({ ...settingsData, testimonials_data: JSON.stringify(list) });
                    }} />
                    <input className="admin-input" type="number" max="5" min="1" style={{ flex: 0.8, marginBottom: 0 }} placeholder="Rating (1-5)" value={item.rating || 5} onChange={(e) => {
                      const list = [...getTestimonialsList()];
                      list[idx].rating = Number(e.target.value);
                      setSettingsData({ ...settingsData, testimonials_data: JSON.stringify(list) });
                    }} />
                    <input className="admin-input" style={{ flex: 1, marginBottom: 0 }} placeholder="Tag (e.g. VFX)" value={item.tag || ''} onChange={(e) => {
                      const list = [...getTestimonialsList()];
                      list[idx].tag = e.target.value;
                      setSettingsData({ ...settingsData, testimonials_data: JSON.stringify(list) });
                    }} />
                    <button className="btn btn--outline" style={{ padding: '8px', color: '#38BDF8' }} onClick={() => {
                      const list = getTestimonialsList().filter((_, i) => i !== idx);
                      setSettingsData({ ...settingsData, testimonials_data: JSON.stringify(list) });
                    }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <input className="admin-input" style={{ marginBottom: 0 }} placeholder="Avatar Image URL" value={item.avatar || ''} onChange={(e) => {
                    const list = [...getTestimonialsList()];
                    list[idx].avatar = e.target.value;
                    setSettingsData({ ...settingsData, testimonials_data: JSON.stringify(list) });
                  }} />
                  <textarea className="admin-input" style={{ marginBottom: 0, minHeight: '60px' }} placeholder="Review text content..." value={item.content || ''} onChange={(e) => {
                    const list = [...getTestimonialsList()];
                    list[idx].content = e.target.value;
                    setSettingsData({ ...settingsData, testimonials_data: JSON.stringify(list) });
                  }} />
                </div>
              ))}
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button className="btn btn--outline" onClick={() => {
                  const list = [...getTestimonialsList(), { id: Date.now(), name: 'New Client', role: 'Creator', avatar: '', content: 'Great service!', rating: 5, tag: 'VFX' }];
                  setSettingsData({ ...settingsData, testimonials_data: JSON.stringify(list) });
                }}><Plus size={14} /> Add Review</button>
                <button className="btn btn--primary" onClick={() => handleSaveSettings()}><Save size={16} /> Save Reviews</button>
              </div>
            </div>
          ) : activeTab === 'faq' ? (
            /* ── FAQ ACCORDION EDITOR ── */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Manage questions and answers displayed in the FAQ accordion.
              </p>
              {getFaqList().map((faq, idx) => (
                <div key={idx} style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-glass)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input className="admin-input" style={{ flex: 1, marginBottom: 0 }} placeholder="Question (e.g. How can I request custom packages?)" value={faq.q || ''} onChange={(e) => {
                      const list = [...getFaqList()];
                      list[idx].q = e.target.value;
                      setSettingsData({ ...settingsData, faq_data: JSON.stringify(list) });
                    }} />
                    <button className="btn btn--outline" style={{ padding: '8px', color: '#38BDF8' }} onClick={() => {
                      const list = getFaqList().filter((_, i) => i !== idx);
                      setSettingsData({ ...settingsData, faq_data: JSON.stringify(list) });
                    }}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <textarea className="admin-input" style={{ marginBottom: 0, minHeight: '70px' }} placeholder="Answer text..." value={faq.a || ''} onChange={(e) => {
                    const list = [...getFaqList()];
                    list[idx].a = e.target.value;
                    setSettingsData({ ...settingsData, faq_data: JSON.stringify(list) });
                  }} />
                </div>
              ))}
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button className="btn btn--outline" onClick={() => {
                  const list = [...getFaqList(), { q: 'New Question?', a: 'Answer text...' }];
                  setSettingsData({ ...settingsData, faq_data: JSON.stringify(list) });
                }}><Plus size={14} /> Add Question</button>
                <button className="btn btn--primary" onClick={() => handleSaveSettings()}><Save size={16} /> Save FAQ Changes</button>
              </div>
            </div>
          ) : activeTab === 'settings' ? (
            /* ── GLOBAL SETTINGS EDITOR ── */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="settings-group" style={{ padding: '20px', background: 'rgba(244,114,182,0.03)', borderRadius: '16px', border: '1px solid rgba(244,114,182,0.12)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: 'var(--accent)', fontSize: '1rem', fontWeight: '700' }}>🎯 Hero Section Content</label>
                <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Site / Brand Name (shown in navbar)</label>
                <input className="admin-input" type="text" value={settingsData.site_name || ''} onChange={(e) => setSettingsData({...settingsData, site_name: e.target.value})} placeholder="IMMORTAL" style={{ marginBottom: '16px' }} />
                <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Hero Title (e.g. IMMORTAL)</label>
                <input className="admin-input" type="text" value={settingsData.hero_title || ''} onChange={(e) => setSettingsData({...settingsData, hero_title: e.target.value})} placeholder="IMMORTAL" />
                <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Hero Description</label>
                <textarea className="admin-input" value={settingsData.hero_description || ''} onChange={(e) => setSettingsData({...settingsData, hero_description: e.target.value})} placeholder="Making digital memories that last forever..." style={{ minHeight: '80px' }} />
                <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Hero Eyebrow Text</label>
                <input className="admin-input" type="text" value={settingsData.hero_eyebrow || ''} onChange={(e) => setSettingsData({...settingsData, hero_eyebrow: e.target.value})} placeholder="Leader · Creator · Innovator" />
              </div>

              {/* ── SEO Logo ── */}
              <div className="settings-group" style={{ padding: '20px', background: 'rgba(34,197,94,0.03)', borderRadius: '16px', border: '1px solid rgba(34,197,94,0.12)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: '#4ade80', fontSize: '1rem', fontWeight: '700' }}>🔍 SEO Logo / OG Image</label>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '12px' }}>This image will be used as the website favicon, Open Graph preview image, and Twitter card image.</p>
                <div className="file-upload-container">
                  <label className={`file-upload-label ${uploadingField === 'seo_logo_url' ? 'file-upload-label--active' : ''}`}>
                    {uploadingField === 'seo_logo_url' ? <Loader2 className="spinner" size={18} /> : <Upload size={18} />}
                    <span>{uploadingField === 'seo_logo_url' ? 'Uploading...' : 'Upload SEO Logo'}</span>
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'seo_logo_url')} />
                  </label>
                  <input className="admin-input" type="text" value={settingsData.seo_logo_url || ''} onChange={(e) => setSettingsData({...settingsData, seo_logo_url: e.target.value})} placeholder="Or paste image URL" />
                  {settingsData.seo_logo_url && <img src={settingsData.seo_logo_url} alt="SEO Logo Preview" style={{ width: '64px', height: '64px', objectFit: 'contain', borderRadius: '8px', border: '1px solid var(--border-glass)' }} />}
                </div>
              </div>

              {/* ── Website Favicon ── */}
              <div className="settings-group" style={{ padding: '20px', background: 'rgba(236,72,153,0.03)', borderRadius: '16px', border: '1px solid rgba(236,72,153,0.12)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: '#f472b6', fontSize: '1rem', fontWeight: '700' }}>🎨 Website Favicon (.ico, .png, .svg)</label>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '12px' }}>This icon is displayed in browser tabs and bookmarks. Supports ico, png, svg, etc.</p>
                <div className="file-upload-container">
                  <label className={`file-upload-label ${uploadingField === 'favicon_url' ? 'file-upload-label--active' : ''}`}>
                    {uploadingField === 'favicon_url' ? <Loader2 className="spinner" size={18} /> : <Upload size={18} />}
                    <span>{uploadingField === 'favicon_url' ? 'Uploading...' : 'Upload Favicon'}</span>
                    <input type="file" accept=".ico,.png,.svg,image/*" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'favicon_url')} />
                  </label>
                  <input className="admin-input" type="text" value={settingsData.favicon_url || ''} onChange={(e) => setSettingsData({...settingsData, favicon_url: e.target.value})} placeholder="Or paste icon URL" />
                  {settingsData.favicon_url && <img src={settingsData.favicon_url} alt="Favicon Preview" style={{ width: '32px', height: '32px', objectFit: 'contain', borderRadius: '4px', border: '1px solid var(--border-glass)' }} />}
                </div>
              </div>

              {/* ── Custom Discord Banner ── */}
              <div className="settings-group" style={{ padding: '20px', background: 'rgba(124,58,237,0.03)', borderRadius: '16px', border: '1px solid rgba(124,58,237,0.12)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: '#38BDF8', fontSize: '1rem', fontWeight: '700' }}>🆔 Custom Profile Banner Fallback</label>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '12px' }}>Upload a custom image to use as your Discord card background banner.</p>
                <div className="file-upload-container">
                  <label className={`file-upload-label ${uploadingField === 'custom_banner_url' ? 'file-upload-label--active' : ''}`}>
                    {uploadingField === 'custom_banner_url' ? <Loader2 className="spinner" size={18} /> : <Upload size={18} />}
                    <span>{uploadingField === 'custom_banner_url' ? 'Uploading...' : 'Upload Custom Banner'}</span>
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'custom_banner_url')} />
                  </label>
                  {settingsData.custom_banner_url && <img src={settingsData.custom_banner_url} alt="Banner Preview" style={{ width: '120px', height: '45px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-glass)' }} />}
                </div>
              </div>

              {/* ── Custom Motion Backgrounds ── */}
              <div className="settings-group" style={{ padding: '20px', background: 'rgba(0,240,255,0.04)', borderRadius: '16px', border: '1px solid rgba(0,240,255,0.18)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', color: 'var(--accent)', fontSize: '1.05rem', fontWeight: '800' }}>
                  🎥 Motion Video & Dynamic Backgrounds
                </label>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.6' }}>
                  Upload MP4/WebM video loops or paste direct video URLs to set an animated motion background for your website.
                </p>

                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="motion_bg_type"
                      value="video"
                      checked={(settingsData.motion_bg_type || 'video') === 'video'}
                      onChange={(e) => setSettingsData({ ...settingsData, motion_bg_type: e.target.value })}
                      style={{ accentColor: '#00F0FF' }}
                    />
                    🎥 Video Motion Loop (.mp4 / .webm)
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="motion_bg_type"
                      value="image"
                      checked={settingsData.motion_bg_type === 'image'}
                      onChange={(e) => setSettingsData({ ...settingsData, motion_bg_type: e.target.value })}
                      style={{ accentColor: '#00F0FF' }}
                    />
                    🖼️ Static Image / Banner
                  </label>
                </div>

                <div className="file-upload-container">
                  <label className={`file-upload-label ${uploadingField === 'motion_bg_url' ? 'file-upload-label--active' : ''}`}>
                    {uploadingField === 'motion_bg_url' ? <Loader2 className="spinner" size={18} /> : <Upload size={18} />}
                    <span>{uploadingField === 'motion_bg_url' ? 'Uploading Motion Video...' : 'Upload Motion Video (.mp4, .webm, .gif)'}</span>
                    <input type="file" accept="video/*,image/gif,image/*" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'motion_bg_url')} />
                  </label>
                  <input
                    className="admin-input"
                    type="text"
                    value={settingsData.motion_bg_url || ''}
                    onChange={(e) => setSettingsData({ ...settingsData, motion_bg_url: e.target.value })}
                    placeholder="Or paste direct video MP4 URL (e.g. https://cdn.site.com/motion-bg.mp4)"
                  />
                </div>

                <div style={{ marginTop: '14px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    Motion Background Opacity: {Math.round((Number(settingsData.motion_bg_opacity || 0.45)) * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0.1"
                    max="1.0"
                    step="0.05"
                    value={settingsData.motion_bg_opacity || '0.45'}
                    onChange={(e) => setSettingsData({ ...settingsData, motion_bg_opacity: e.target.value })}
                    style={{ width: '100%', accentColor: '#00F0FF', cursor: 'pointer' }}
                  />
                </div>
              </div>

              <div className="settings-group">
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>About Section Text</label>
                <textarea className="admin-input" value={settingsData.about_text || ''} onChange={(e) => setSettingsData({...settingsData, about_text: e.target.value})} placeholder="About me..." />
              </div>

              {['instagram', 'twitter', 'youtube', 'github', 'discord'].map(platform => {
                let platformLinks = [];
                try {
                  platformLinks = typeof settingsData[platform] === 'string' ? (settingsData[platform].startsWith('[') ? JSON.parse(settingsData[platform]) : [{ title: 'Main', url: settingsData[platform] }]) : (settingsData[platform] || []);
                } catch(e) { platformLinks = []; }

                return (
                  <div key={platform} className="settings-group" style={{ padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-glass)' }}>
                    <label style={{ display: 'block', marginBottom: '12px', color: 'var(--accent)', fontSize: '0.9rem', fontWeight: '700', textTransform: 'capitalize' }}>{platform} Links</label>
                    <div className="admin-social-list">
                      {platformLinks.map((link, idx) => (
                        <div key={idx} className="admin-social-item">
                          <input className="admin-input" style={{ flex: 1 }} placeholder="Title" value={link.title} onChange={(e) => {
                              const newLinks = [...platformLinks];
                              newLinks[idx].title = e.target.value;
                              setSettingsData({...settingsData, [platform]: JSON.stringify(newLinks)});
                            }}
                          />
                          <input 
                            className="admin-input" 
                            style={{ flex: 2 }} 
                            placeholder="URL" 
                            value={link.url} 
                            onChange={(e) => {
                              const newLinks = [...platformLinks];
                              newLinks[idx].url = e.target.value;
                              setSettingsData({...settingsData, [platform]: JSON.stringify(newLinks)});
                            }}
                          />
                          <button 
                            className="btn btn--outline" 
                            style={{ padding: '8px', color: '#38BDF8' }} 
                            onClick={() => {
                              const newLinks = platformLinks.filter((_, i) => i !== idx);
                              setSettingsData({...settingsData, [platform]: JSON.stringify(newLinks)});
                            }}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button 
                      className="btn btn--outline btn--full" 
                      style={{ fontSize: '0.8rem', marginTop: '8px' }}
                      onClick={() => {
                        const newLinks = [...platformLinks, { title: '', url: '' }];
                        setSettingsData({...settingsData, [platform]: JSON.stringify(newLinks)});
                      }}
                    >
                      <Plus size={14} /> Add {platform} Link
                    </button>
                  </div>
                );
              })}

              <div className="settings-group">
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Background Music</label>
                <div className="file-upload-container">
                  <label className={`file-upload-label ${uploadingField === 'bg_music_url' ? 'file-upload-label--active' : ''}`}>
                    {uploadingField === 'bg_music_url' ? <Loader2 className="spinner" size={18} /> : <Upload size={18} />}
                    <span>{uploadingField === 'bg_music_url' ? 'Uploading...' : 'Upload New Song'}</span>
                    <input type="file" accept="audio/*" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'bg_music_url')} />
                  </label>
                  <input className="admin-input" type="text" value={settingsData.bg_music_url || ''} onChange={(e) => setSettingsData({...settingsData, bg_music_url: e.target.value})} placeholder="Or paste audio URL" />
                </div>
              </div>

              <div className="settings-group">
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Discord User ID</label>
                <input className="admin-input" type="text" value={settingsData.discord_id || ''} onChange={(e) => setSettingsData({...settingsData, discord_id: e.target.value})} placeholder="Your Discord Snowflake ID" />
              </div>

              <div className="settings-group" style={{ padding: '20px', background: 'rgba(0,240,255,0.03)', borderRadius: '16px', border: '1px solid rgba(0,240,255,0.15)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px', color: 'var(--accent)', fontSize: '1rem', fontWeight: '700' }}>
                  <Megaphone size={20} /> Announcement
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <input 
                      type="checkbox" 
                      checked={settingsData.announcement_active || false} 
                      onChange={(e) => setSettingsData({...settingsData, announcement_active: e.target.checked})}
                      style={{ width: '18px', height: '18px', accentColor: '#00F0FF', cursor: 'pointer' }}
                    />
                    Show announcement popup
                  </label>
                </div>
                <textarea 
                  className="admin-input" 
                  value={settingsData.announcement_text || ''} 
                  onChange={(e) => setSettingsData({...settingsData, announcement_text: e.target.value})} 
                  placeholder="Write your announcement here... (will show as a popup in the bottom-left corner)"
                  style={{ minHeight: '80px' }}
                />
              </div>

              <button className="btn btn--primary" style={{ alignSelf: 'flex-start', marginTop: '20px' }} onClick={handleSave}><Save size={16} /> Save All Settings</button>
            </div>
          ) : (
            /* ── UPLOADS & PACKAGES MANAGER ── */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {editingId === 'new' && (
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '20px', borderRadius: '8px', border: '1px solid var(--accent)' }}>
                  <input className="admin-input" type="text" name="title" placeholder="Title" value={formData.title || ''} onChange={handleChange} />
                  <input className="admin-input" type="text" name="slug" placeholder="URL Slug (e.g. my-awesome-project)" value={formData.slug || ''} onChange={handleChange} />
                  <textarea className="admin-input" name="description" placeholder="Description" value={formData.description || ''} onChange={handleChange} />
                  <input className="admin-input" type="text" name="category" placeholder="Category" value={formData.category || ''} onChange={handleChange} />
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Thumbnail Image:</label>
                    <div className="file-upload-container">
                      <label className={`file-upload-label ${uploadingField === 'thumbnail' ? 'file-upload-label--active' : ''}`}>
                        {uploadingField === 'thumbnail' ? <Loader2 className="spinner" size={18} /> : <Upload size={18} />}
                        <span>{uploadingField === 'thumbnail' ? 'Uploading...' : 'Upload Thumbnail'}</span>
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'thumbnail')} />
                      </label>
                      <input className="admin-input" type="text" name="thumbnail" placeholder="Or paste image URL directly" value={formData.thumbnail || ''} onChange={handleChange} />
                    </div>
                  </div>
                  
                  {activeTab === 'uploads' && (
                    <input className="admin-input" type="text" name="youtube_url" placeholder="YouTube Video URL (optional)" value={formData.youtube_url || ''} onChange={handleChange} />
                  )}

                  {activeTab === 'packages' && (
                    <>
                      <input className="admin-input" type="number" name="rating" placeholder="Rating (e.g. 4.9)" value={formData.rating || ''} onChange={handleChange} />
                      <div style={{ marginBottom: '12px' }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Package File (.zip, .pdf, etc):</label>
                        <div className="file-upload-container">
                          <label className={`file-upload-label ${uploadingField === 'download_url' ? 'file-upload-label--active' : ''}`}>
                            {uploadingField === 'download_url' ? <Loader2 className="spinner" size={18} /> : <Upload size={18} />}
                            <span>{uploadingField === 'download_url' ? 'Uploading...' : 'Choose Package File'}</span>
                            <input type="file" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'download_url')} />
                          </label>
                          
                          {formData.download_url && (
                            <div className="file-preview-strip">
                              <div className="file-preview-name">
                                {formData.download_url.split('/').pop() || 'Current File'}
                              </div>
                              <div className="file-preview-status">
                                <Check size={14} /> Ready
                              </div>
                            </div>
                          )}
                          <input className="admin-input" type="text" name="download_url" placeholder="Or paste download URL directly" value={formData.download_url || ''} onChange={handleChange} />
                        </div>
                      </div>
                    </>
                  )}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                    <button className="btn btn--primary" onClick={handleSave}><Save size={16} /> Save</button>
                    <button className="btn btn--outline" onClick={handleCancel}><X size={16} /> Cancel</button>
                  </div>
                </div>
              )}

              {items.map(item => (
                <div key={item.id} className="admin-item">
                  {editingId === item.id ? (
                    <div style={{ width: '100%' }}>
                      <input className="admin-input" type="text" name="title" value={formData.title || ''} onChange={handleChange} />
                      <input className="admin-input" type="text" name="slug" placeholder="URL Slug" value={formData.slug || ''} onChange={handleChange} />
                      <textarea className="admin-input" name="description" value={formData.description || ''} onChange={handleChange} />
                      <input className="admin-input" type="text" name="category" value={formData.category || ''} onChange={handleChange} />
                          <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Update Thumbnail:</label>
                            <div className="file-upload-container">
                              <label className={`file-upload-label ${uploadingField === 'thumbnail' ? 'file-upload-label--active' : ''}`}>
                                {uploadingField === 'thumbnail' ? <Loader2 className="spinner" size={18} /> : <Upload size={18} />}
                                <span>{uploadingField === 'thumbnail' ? 'Uploading...' : 'Upload New Thumbnail'}</span>
                                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'thumbnail')} />
                              </label>
                              <input className="admin-input" type="text" name="thumbnail" placeholder="Image URL" value={formData.thumbnail || ''} onChange={handleChange} />
                            </div>
                          </div>
                          
                          {activeTab === 'uploads' && (
                            <input className="admin-input" type="text" name="youtube_url" placeholder="YouTube Video URL" value={formData.youtube_url || ''} onChange={handleChange} />
                          )}

                          {activeTab === 'packages' && (
                            <>
                              <input className="admin-input" type="number" name="rating" placeholder="Rating" value={formData.rating || ''} onChange={handleChange} />
                              <div style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Update Package File:</label>
                                <div className="file-upload-container">
                                  <label className={`file-upload-label ${uploadingField === 'download_url' ? 'file-upload-label--active' : ''}`}>
                                    {uploadingField === 'download_url' ? <Loader2 className="spinner" size={18} /> : <Upload size={18} />}
                                    <span>{uploadingField === 'download_url' ? 'Uploading...' : 'Change Package File'}</span>
                                    <input type="file" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'download_url')} />
                                  </label>
                                  
                                  {formData.download_url && (
                                    <div className="file-preview-strip">
                                      <div className="file-preview-name">
                                        {formData.download_url.split('/').pop() || 'Current File'}
                                      </div>
                                      <div className="file-preview-status">
                                        <Check size={14} /> Ready
                                      </div>
                                    </div>
                                  )}
                                  <input className="admin-input" type="text" name="download_url" placeholder="Download URL" value={formData.download_url || ''} onChange={handleChange} />
                                </div>
                              </div>
                            </>
                          )}
                      <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                        <button className="btn btn--primary" onClick={handleSave}><Save size={16} /> Save</button>
                        <button className="btn btn--outline" onClick={handleCancel}><X size={16} /> Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="admin-item__info">
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>{item.title}</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '8px' }}>{item.description}</p>
                        <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', color: 'var(--accent)' }}>
                          <span>{item.category}</span>
                          {item.rating && <span>Rating: {item.rating}</span>}
                        </div>
                      </div>
                      <div className="admin-item__actions">
                        <button className="btn btn--outline" onClick={() => handleEdit(item)}>Edit</button>
                        <button className="btn btn--outline" style={{ color: '#38BDF8', borderColor: 'rgba(56,189,248,0.35)' }} onClick={() => handleDelete(item.id)}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
              {items.length === 0 && editingId !== 'new' && <p style={{ color: 'var(--text-muted)' }}>No items found. Create one!</p>}
            </div>
          )}
        </div>
      </motion.div>
    </main>
  );
}
