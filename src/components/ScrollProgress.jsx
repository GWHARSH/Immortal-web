import { useEffect, useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

export default function ScrollProgress() {
  const isMobile = typeof window !== 'undefined' && (
    window.innerWidth <= 768 ||
    ('ontouchstart' in window)
  );

  if (isMobile) {
    return null;
  }

  return <ScrollProgressInner />;
}

function ScrollProgressInner() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 300,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className="scroll-progress-bar"
      style={{ scaleX }}
    />
  );
}
