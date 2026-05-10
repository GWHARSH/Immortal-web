import { useEffect } from 'react';

export default function DevToolsBlocker() {
  useEffect(() => {
    // ═══════════════════════════════════════════════════
    // YAMATO SECURITY PROTOCOL — Professional Grade
    // ═══════════════════════════════════════════════════

    // BYPASS FOR DEVELOPER (Localhost and Local IPs)
    const hostname = window.location.hostname;
    const isLocal = hostname === 'localhost' || 
                   hostname === '127.0.0.1' || 
                   hostname.startsWith('192.168.') || 
                   hostname.startsWith('10.') || 
                   hostname.endsWith('.local');
    
    if (isLocal) return;

    let devtoolsOpen = false;

    const renderAccessDenied = () => {
      if (devtoolsOpen) return;
      devtoolsOpen = true;

      document.body.innerHTML = `
        <div style="display:flex;flex-direction:column;justify-content:center;align-items:center;height:100vh;background:#0a0a0f;color:#a78bfa;font-family:'Outfit',sans-serif;text-align:center;padding:40px;z-index:9999999;position:fixed;inset:0;">
          <div style="position:absolute;inset:0;background:radial-gradient(circle at center, rgba(167,139,250,0.08) 0%, transparent 70%);"></div>
          <div style="position:relative;z-index:1;">
            <div style="width:80px;height:80px;border:3px solid rgba(167,139,250,0.3);border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 32px;animation:pulse-ring 2s ease-in-out infinite;">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h1 style="font-size:clamp(2rem,8vw,3.5rem);margin-bottom:16px;font-weight:900;letter-spacing:-2px;background:linear-gradient(135deg,#a78bfa,#6d28d9);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">ACCESS RESTRICTED</h1>
            <p style="font-size:clamp(0.9rem,3vw,1.1rem);max-width:600px;line-height:1.6;color:#8a8a9a;margin:0 auto;">Developer Tools detected. This website is protected by the YAMATO Security Protocol. Please close DevTools and refresh the page to continue.</p>
            <div style="margin-top:48px;display:grid;grid-template-columns:repeat(2,1fr);gap:12px;max-width:400px;margin-left:auto;margin-right:auto;">
              <div style="padding:16px;border:1px solid rgba(167,139,250,0.15);background:rgba(167,139,250,0.03);border-radius:16px;font-size:0.8rem;color:#a78bfa;font-weight:bold;">🔒 SECURE</div>
              <div style="padding:16px;border:1px solid rgba(167,139,250,0.15);background:rgba(167,139,250,0.03);border-radius:16px;font-size:0.8rem;color:#a78bfa;font-weight:bold;">🔒 PROTECTED</div>
            </div>
            <p style="margin-top:48px;color:#333;font-size:0.7rem;text-transform:uppercase;letter-spacing:3px;">© 2026 YAMATO SECURITY</p>
          </div>
        </div>
        <style>@keyframes pulse-ring{0%,100%{box-shadow:0 0 0 0 rgba(167,139,250,0.3)}50%{box-shadow:0 0 0 15px rgba(167,139,250,0)}}</style>
      `;
      document.body.style.overflow = 'hidden';

      // Use a more gentle approach for local devs if they somehow trigger this
      if (!window.location.hostname.includes('localhost')) {
        setInterval(() => { debugger; }, 500);
      }
      clearInterval(detectInterval);
    };

    // 1. Keyboard & Right Click Protection
    const handleKeydown = (e) => {
      if (
        e.keyCode === 123 ||
        (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) ||
        (e.ctrlKey && e.keyCode === 85)
      ) {
        e.preventDefault();
        return false;
      }
    };

    const handleContextMenu = (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    window.addEventListener('keydown', handleKeydown);
    window.addEventListener('contextmenu', handleContextMenu, true);

    // 2. Detection Logic
    const detect = () => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile) return;

      const threshold = 250; // Increased threshold
      const widthDiff = window.outerWidth - window.innerWidth;
      const heightDiff = window.outerHeight - window.innerHeight;

      if (widthDiff > threshold || heightDiff > threshold) {
        renderAccessDenied();
      }
    };

    const detectInterval = setInterval(detect, 3000); // Slower polling

    return () => {
      window.removeEventListener('keydown', handleKeydown);
      window.removeEventListener('contextmenu', handleContextMenu, true);
      clearInterval(detectInterval);
    };
  }, []);

  return null;
}
