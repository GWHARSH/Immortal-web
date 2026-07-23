import { useState, useEffect } from 'react';

function getDeviceTier() {
  if (typeof window === 'undefined') return 'high';

  const isMobileScreen = window.innerWidth <= 768 || ('ontouchstart' in window && window.innerWidth <= 1024);

  // On Desktop / Laptop / PC monitors, default to 'high' performance unless saveData is on
  if (!isMobileScreen) {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn?.saveData === true) return 'medium';
    return 'high';
  }

  // On Mobile screens / Touch devices:
  // MediaTek P20, Snapdragon 600-series, Helio A/P/G series CPUs (Cortex A53/A55)
  // report cores=8 and RAM=3 or 4, but Mali/Adreno GPUs & single-core IPC lag with complex WebGL/Canvas/Blur.
  const ram = navigator.deviceMemory || 4;
  const cores = navigator.hardwareConcurrency || 4;

  // Only flagship mobile devices with >= 8GB RAM & 8 cores get 'medium', all other mobile devices get 'low'
  if (ram >= 8 && cores >= 8) {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (conn?.saveData === true) return 'low';
    return 'medium';
  }

  return 'low';
}

export function useDevicePerformance() {
  const [tier, setTier] = useState(() => getDeviceTier());

  useEffect(() => {
    const updateTier = () => {
      const currentTier = getDeviceTier();
      setTier(currentTier);
      const isMobile = window.innerWidth <= 768;
      document.body.classList.remove('perf-low', 'perf-medium', 'perf-high');
      document.body.classList.add(`perf-${currentTier}`);
      if (isMobile) {
        document.body.classList.add('is-mobile');
      } else {
        document.body.classList.remove('is-mobile');
      }
    };

    updateTier();
    window.addEventListener('resize', updateTier);

    return () => window.removeEventListener('resize', updateTier);
  }, []);

  return tier;
}
