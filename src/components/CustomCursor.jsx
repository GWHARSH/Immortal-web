import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function CustomCursor() {
  const isTouchOrMobile = typeof window !== 'undefined' && (
    window.innerWidth <= 768 ||
    window.matchMedia('(pointer: coarse)').matches ||
    'ontouchstart' in window
  );

  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isTouchOrMobile) return;
    setIsVisible(true);

    const onMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });

      const target = e.target;
      if (
        target &&
        (target.tagName === 'A' ||
          target.tagName === 'BUTTON' ||
          target.closest('a') ||
          target.closest('button') ||
          target.closest('.card') ||
          target.closest('.bento-card') ||
          target.closest('.filter-chip'))
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      <motion.div
        className="custom-cursor-dot"
        animate={{
          x: mousePos.x - 4,
          y: mousePos.y - 4,
          scale: isClicking ? 0.6 : isHovered ? 1.5 : 1,
        }}
        transition={{ type: 'spring', stiffness: 1200, damping: 50, mass: 0.1 }}
      />
      <motion.div
        className="custom-cursor-ring"
        animate={{
          x: mousePos.x - 18,
          y: mousePos.y - 18,
          scale: isClicking ? 0.8 : isHovered ? 1.8 : 1,
          borderColor: isHovered ? '#00F0FF' : 'rgba(56, 189, 248, 0.4)',
          backgroundColor: isHovered ? 'rgba(0, 240, 255, 0.1)' : 'transparent',
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </>
  );
}
