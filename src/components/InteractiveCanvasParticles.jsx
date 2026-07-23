import { useEffect, useRef } from 'react';
import { useDevicePerformance } from '../hooks/useDevicePerformance';

export default function InteractiveCanvasParticles() {
  const canvasRef = useRef(null);
  const tier = useDevicePerformance();

  const isMobile = typeof window !== 'undefined' && (window.innerWidth <= 768 || 'ontouchstart' in window);
  if (tier === 'low' || isMobile) {
    return null;
  }

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initDots();
    };
    window.addEventListener('resize', handleResize);

    const mouse = {
      x: -1000,
      y: -1000,
      radius: 190,
      isMoving: false,
      lastMoveTime: 0,
    };

    let trailParticles = [];
    let shockwaves = [];

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.isMoving = true;
      mouse.lastMoveTime = Date.now();

      // Emit trailing cyan/blue sparkles on cursor move (high tier only)
      if (tier === 'high' && Math.random() < 0.45) {
        trailParticles.push({
          x: e.clientX + (Math.random() - 0.5) * 8,
          y: e.clientY + (Math.random() - 0.5) * 8,
          vx: (Math.random() - 0.5) * 1.0,
          vy: (Math.random() - 0.5) * 1.0 - 0.4,
          size: Math.random() * 2 + 1,
          alpha: 0.85,
          color: Math.random() > 0.3 ? '#00F0FF' : '#38BDF8',
        });
      }
    };

    const handleClick = (e) => {
      if (tier === 'high') {
        shockwaves.push({
          x: e.clientX,
          y: e.clientY,
          radius: 10,
          maxRadius: 200,
          alpha: 0.85,
        });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    let dots = [];

    const initDots = () => {
      let density = tier === 'high' ? Math.min(Math.floor((width * height) / 14000), 65) : 25;
      dots = [];

      for (let i = 0; i < density; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        dots.push({
          x,
          y,
          originX: x,
          originY: y,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          radius: Math.random() * 1.5 + 1.2,
          color: Math.random() > 0.4 ? '#00F0FF' : '#38BDF8',
          alpha: Math.random() * 0.45 + 0.4,
          pulse: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.02 + 0.01,
        });
      }
    };

    initDots();

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      if (Date.now() - mouse.lastMoveTime > 3000) {
        mouse.isMoving = false;
      }

      // Render shockwaves
      for (let i = shockwaves.length - 1; i >= 0; i--) {
        const sw = shockwaves[i];
        sw.radius += 6;
        sw.alpha -= 0.025;

        if (sw.alpha <= 0 || sw.radius >= sw.maxRadius) {
          shockwaves.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = '#00F0FF';
        ctx.globalAlpha = sw.alpha;
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      // Render cursor trailing sparkles
      for (let i = trailParticles.length - 1; i >= 0; i--) {
        const tp = trailParticles[i];
        tp.x += tp.vx;
        tp.y += tp.vy;
        tp.alpha -= 0.025;
        tp.size *= 0.96;

        if (tp.alpha <= 0 || tp.size <= 0.2) {
          trailParticles.splice(i, 1);
          continue;
        }

        ctx.beginPath();
        ctx.arc(tp.x, tp.y, tp.size, 0, Math.PI * 2);
        ctx.fillStyle = tp.color;
        ctx.globalAlpha = tp.alpha;
        ctx.fill();
      }

      // Update & render dots and connecting lines
      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];

        d.pulse += d.speed;
        const currentRadius = d.radius + Math.sin(d.pulse) * 0.5;

        d.x += d.vx;
        d.y += d.vy;

        const distFromOriginSq = (d.x - d.originX) ** 2 + (d.y - d.originY) ** 2;
        if (distFromOriginSq > 4900) {
          d.vx += (d.originX - d.x) * 0.0004;
          d.vy += (d.originY - d.y) * 0.0004;
        }

        if (d.x < 0 || d.x > width) d.vx *= -1;
        if (d.y < 0 || d.y > height) d.vy *= -1;

        const dx = mouse.x - d.x;
        const dy = mouse.y - d.y;
        const distToMouseSq = dx * dx + dy * dy;

        if (distToMouseSq < 36100) { // 190^2
          const distToMouse = Math.sqrt(distToMouseSq);
          const force = (mouse.radius - distToMouse) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          d.x -= Math.cos(angle) * force * 2.0;
          d.y -= Math.sin(angle) * force * 2.0;
        }

        const isNearMouse = distToMouseSq < 36100;
        const renderRadius = isNearMouse ? currentRadius * 1.3 : currentRadius;

        ctx.beginPath();
        ctx.arc(d.x, d.y, Math.max(0.8, renderRadius), 0, Math.PI * 2);
        ctx.fillStyle = isNearMouse ? '#38BDF8' : d.color;
        ctx.globalAlpha = isNearMouse ? Math.min(1, d.alpha + 0.3) : d.alpha;
        ctx.fill();

        // Connect Energy Lines to Mouse
        if (distToMouseSq < 22500) { // 150^2
          const distToMouse = Math.sqrt(distToMouseSq);
          ctx.beginPath();
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.strokeStyle = '#00F0FF';
          ctx.globalAlpha = (1 - distToMouse / 150) * 0.35;
          ctx.lineWidth = 1.0;
          ctx.stroke();
        }

        // Connect lines between neighboring dots (Constellation Net)
        for (let j = i + 1; j < dots.length; j++) {
          const d2 = dots[j];
          const distSq = (d.x - d2.x) ** 2 + (d.y - d2.y) ** 2;
          const maxDist = 135;

          if (distSq < maxDist * maxDist) {
            const distBetween = Math.sqrt(distSq);
            ctx.beginPath();
            ctx.moveTo(d.x, d.y);
            ctx.lineTo(d2.x, d2.y);
            ctx.strokeStyle = '#00F0FF';
            ctx.globalAlpha = (1 - distBetween / maxDist) * 0.22;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
      cancelAnimationFrame(animationFrameId);
    };
  }, [tier]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 2,
        opacity: 0.85,
      }}
    />
  );
}
