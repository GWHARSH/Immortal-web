import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1497720624125051090/0gomnHZb7waWyXuXD2RjdahM5Y6RiRpBEQ1Lh5wTN4Srin2G6SW48EJSPkC8AaxLGMhZ';

export function useTracking() {
  const location = useLocation();
  const sessionActions = useRef([]);
  const startTime = useRef(Date.now());

  useEffect(() => {
    // 1. Capture Entry Info
    const logEntry = async () => {
      try {
        const ipRes = await fetch('https://ipapi.co/json/');
        const ipData = await ipRes.json();

        const entryPayload = {
          embeds: [{
            title: "🌐 NEW VISITOR ARRIVED",
            color: 0xa78bfa,
            fields: [
              { name: "📍 IP Address", value: `\`${ipData.ip}\``, inline: true },
              { name: "🌍 Location", value: `${ipData.city}, ${ipData.country_name}`, inline: true },
              { name: "📡 ISP", value: ipData.org, inline: true },
              { name: "🖥️ Device", value: navigator.platform, inline: true },
              { name: "🌐 Browser", value: navigator.userAgent.split(' ').pop(), inline: true },
              { name: "📄 First Page", value: window.location.pathname, inline: false }
            ],
            footer: { text: "YAMATO Intelligence Protocol Active" },
            timestamp: new Date().toISOString()
          }]
        };

        fetch(DISCORD_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(entryPayload)
        });
      } catch (err) {
        // Silent fail to stay stealthy
      }
    };

    logEntry();

    // 2. Track Clicks
    const handleClick = (e) => {
      const target = e.target.closest('a, button');
      if (target) {
        sessionActions.current.push({
          type: 'click',
          label: target.innerText || target.ariaLabel || 'unknown',
          time: new Date().toLocaleTimeString()
        });
      }
    };

    window.addEventListener('click', handleClick);

    // 3. Exit Log (Send on Page Close)
    const logExit = () => {
      const duration = Math.round((Date.now() - startTime.current) / 1000);
      const exitPayload = {
        embeds: [{
          title: "🚪 VISITOR DEPARTED",
          color: 0xff4757,
          description: `User spent **${duration} seconds** on the site.`,
          fields: [
            { 
              name: "🧠 Behavioral Summary", 
              value: sessionActions.current.length > 0 
                ? sessionActions.current.map(a => `• ${a.time}: Clicked "${a.label}"`).join('\n').slice(0, 1000)
                : "User just lurked without clicking."
            }
          ],
          footer: { text: "AI Analysis: User seems interested in " + (sessionActions.current[0]?.label || "nothing specific") },
          timestamp: new Date().toISOString()
        }]
      };

      // Use sendBeacon for reliable delivery on exit
      navigator.sendBeacon(DISCORD_WEBHOOK_URL, JSON.stringify(exitPayload));
    };

    window.addEventListener('beforeunload', logExit);

    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('beforeunload', logExit);
    };
  }, []);

  // Track Page Changes
  useEffect(() => {
    sessionActions.current.push({
      type: 'nav',
      label: `Moved to ${location.pathname}`,
      time: new Date().toLocaleTimeString()
    });
  }, [location]);
}
