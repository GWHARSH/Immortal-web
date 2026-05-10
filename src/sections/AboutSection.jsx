import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import DiscordStatus from '../components/DiscordStatus';

export default function AboutSection() {
  const [aboutText, setAboutText] = useState("");
  const [discordId, setDiscordId] = useState("");

  useEffect(() => {
    supabase.from('settings').select('*').single().then(({ data, error }) => {
      if (error) console.error("Settings fetch error:", error);
      if (data) {
        setAboutText(data.about_text || "");
        setDiscordId(data.discord_id || "");
      }
    });
  }, []);

  return (
    <section className="about" id="about">
      <div className="about__inner">
        <motion.div
          className="about__header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="section-label">Identity</span>
          <h2 className="section-title">About <span className="text-accent">Me</span></h2>
        </motion.div>

        <div className="about__bento">
          {/* Bio Card */}
          <motion.div
            className="bento-card bento-card--bio"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="about__text-block">
              {aboutText ? aboutText.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              )) : <p>Loading biography...</p>}
            </div>
          </motion.div>

          {/* Discord Card */}
          <motion.div
            className="bento-card bento-card--discord"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <DiscordStatus discordId={discordId} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
