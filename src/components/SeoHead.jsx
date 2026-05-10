import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

/**
 * SeoHead — dynamically manages document <head> meta tags
 * Reads SEO settings from Firebase and updates OG image, title, description.
 */
export default function SeoHead() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    supabase.from('settings').select('*').single().then(({ data }) => {
      if (data) setSettings(data);
    });
  }, []);

  useEffect(() => {
    if (!settings) return;

    // Update page title (with no m-dashes, using clean normal hyphens)
    const rawTitle = settings.site_name || settings.hero_title || 'HIXX PLAYZ';
    const heroTitle = rawTitle.toUpperCase().includes('HIXX') ? rawTitle : `${rawTitle} - HIXX PLAYZ`;
    const finalTitle = `${heroTitle} - Immortal Demi Gods - Demigods Clan`;
    document.title = finalTitle;

    // Update meta description (fully optimized for SEO keywords, normal hyphens only)
    const baseDesc = settings.hero_description || 'Official portfolio of HIXX PLAYZ, immortal from demi gods. Explore uploads, gaming packages, and media from demigods clan.';
    const cleanDesc = baseDesc.replace(/—|–/g, ' - '); // strip any stray m-dashes/en-dashes
    const seoDesc = `${cleanDesc} | Join the world of immortal demi gods and explore exclusive gaming packages.`.slice(0, 160);
    updateMeta('description', seoDesc);

    // Update keywords dynamically
    const keywords = 'HIXX PLAYZ, hixx playz, immortal from demi gods, immortal demi gods, demigods, demigods clan, demigods gaming, gaming portfolio, immortal playz, gaming downloads';
    updateMeta('keywords', keywords);

    // Update OG tags (using clean titles and descriptions with standard hyphens)
    const logoUrl = settings.seo_logo_url;
    if (logoUrl) {
      updateMeta('og:image', logoUrl, 'property');
      updateMeta('twitter:image', logoUrl, 'property');
    }

    updateMeta('og:title', `${heroTitle} - Immortal from Demi Gods`, 'property');
    updateMeta('og:description', seoDesc, 'property');
    updateMeta('twitter:title', `${heroTitle} - Immortal from Demi Gods`, 'property');
    updateMeta('twitter:description', seoDesc, 'property');

    // Update favicon with separate favicon_url or fallback
    const faviconUrl = settings.favicon_url || logoUrl || '/favicon.svg';
    const existingFavicon = document.querySelector('link[rel="icon"]');
    if (existingFavicon) {
      existingFavicon.href = faviconUrl;
      if (faviconUrl.endsWith('.svg') || faviconUrl.startsWith('data:image/svg+xml')) {
        existingFavicon.type = 'image/svg+xml';
      } else if (faviconUrl.endsWith('.ico') || faviconUrl.startsWith('data:image/x-icon') || faviconUrl.includes('image/vnd.microsoft.icon') || faviconUrl.includes('x-icon')) {
        existingFavicon.type = 'image/x-icon';
      } else {
        existingFavicon.type = 'image/png';
      }
    }

    // Add JSON-LD structured data with clean hyphens and keywords
    let jsonLdScript = document.getElementById('seo-jsonld');
    if (!jsonLdScript) {
      jsonLdScript = document.createElement('script');
      jsonLdScript.id = 'seo-jsonld';
      jsonLdScript.type = 'application/ld+json';
      document.head.appendChild(jsonLdScript);
    }
    jsonLdScript.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: heroTitle,
      alternateName: ['HIXX PLAYZ', 'Immortal', 'Immortal Demi Gods', 'Demigods'],
      description: seoDesc,
      image: logoUrl || '/og-image.png',
      url: 'https://alwaysharsh.lol',
      sameAs: getSameAsLinks(settings),
    });
  }, [settings]);

  return null;
}

function updateMeta(name, content, attr = 'name') {
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function getSameAsLinks(settings) {
  const links = [];
  const platforms = ['instagram', 'twitter', 'youtube', 'github', 'discord'];
  platforms.forEach((p) => {
    try {
      const val = settings[p];
      if (!val) return;
      const parsed = typeof val === 'string' && val.startsWith('[') ? JSON.parse(val) : [{ url: val }];
      parsed.forEach((l) => { if (l.url) links.push(l.url); });
    } catch { /* skip */ }
  });
  return links;
}
