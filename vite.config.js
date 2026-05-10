import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import obfuscator from 'vite-plugin-javascript-obfuscator';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ══════════════════════════════════════════════════════════════════
//  YAMATO BOT SHIELD — Server-side middleware
//  Intercepts ALL requests before files are served.
//  Catches: HTTrack, wget, curl, Scrapy, Python, Go clients,
//           headless browsers, SEO crawlers, AI scrapers, archiver bots.
// ══════════════════════════════════════════════════════════════════

// ── Load troll page once at startup ──────────────────────────────
const TROLL_HTML = (() => {
  try {
    return readFileSync(resolve(__dirname, 'public/troll.html'), 'utf-8');
  } catch {
    return `<!DOCTYPE html><html><head><title>403</title></head><body
      style="background:#020204;color:#f472b6;font-family:monospace;display:flex;
             align-items:center;justify-content:center;min-height:100vh;margin:0;text-align:center">
      <div><h1 style="font-size:4rem">💀</h1><h2>GG NO RE SKID</h2>
      <p style="color:#6a6a7a">Protected by YAMATO Security Protocol v5.0</p></div>
    </body></html>`;
  }
})();

// ── Known bad User-Agent substrings ──────────────────────────────
// Split into HARD (blocked on all environments) and SOFT (production only).
const HARD_BLOCK_UA = [
  // Website downloaders / mirrors
  'httrack', 'webcopier', 'teleport', 'webstripper', 'blackwidow',
  'offline explorer', 'sitesucker', 'sitesnagger', 'webzip',
  'webmirror', 'webgather', 'copycat', 'pagegrabber',
  // CLI HTTP clients
  'wget/', 'curl/', 'libwww', 'libwww-perl',
  // Language HTTP clients
  'python-requests', 'python-urllib', 'python-httpx',
  'go-http-client', 'java/', 'okhttp/', 'ruby',
  'node-fetch', 'axios/', 'got/', 'superagent',
  // Scrapers / crawlers
  'scrapy', 'nutch', 'larbin', 'htmlunit',
  // Email harvesters
  'emailsiphon', 'emailwolf', 'extractorpro',
  // Headless
  'phantomjs', 'headlesschrome', 'headless',
  // Generic bots with no browser context
  'lwp-request', 'lwp-trivial', 'urllib',
];

const SOFT_BLOCK_UA = [
  // SEO / data bots (block in production)
  'ahrefsbot', 'semrushbot', 'mj12bot', 'dotbot', 'blexbot',
  'petalbot', 'dataforseobot', 'bytespider',
  // AI crawlers
  'claudebot', 'gptbot', 'chatgpt-user', 'ccbot', 'anthropic-ai',
  'omgili', 'diffbot', 'proximic',
  // Archive / mirror bots
  'ia_archiver', 'archive.org_bot', 'webarchive',
  // Generic aggressive crawlers
  'screaming frog', 'spider', 'crawler',
];

// ── Allowed bots (search engines — don't block for SEO) ──────────
const ALLOWED_UA = ['googlebot', 'bingbot', 'duckduckbot', 'yandexbot', 'baiduspider'];

// ── The detection function ────────────────────────────────────────
function isHostileClient(req) {
  const ua = (req.headers['user-agent'] || '').toLowerCase();
  const host = (req.headers.host || '').toLowerCase();
  const accept = req.headers['accept'] || '';
  const url = req.url || '/';

  // ── Always skip internal Vite plumbing (HMR, module serving) ────
  // These are NOT web pages — they're Vite's own transport layer.
  if (
    url.startsWith('/@vite') ||
    url.startsWith('/@react-refresh') ||
    url.startsWith('/node_modules') ||
    url === '/healthz' ||
    url === '/favicon.ico' ||
    url.endsWith('.hot-update.js') ||
    url.endsWith('.hot-update.json')
  ) return false;

  // ── Allow legitimate search engines everywhere ───────────────────
  if (ALLOWED_UA.some(p => ua.includes(p))) return false;

  // ── HARD BLOCK — runs on ALL environments including localhost ────
  // If you're using wget/curl/httrack, you get trolled. Period.
  if (HARD_BLOCK_UA.some(p => ua.includes(p))) return true;

  // Empty or suspiciously short UA
  if (!ua || ua.length < 8) return true;

  // UA starts with a language/tool identifier (not a browser)
  if (/^(java|perl|python|ruby|go|curl|wget|fetch|http|lwp|libwww)/i.test(ua)) return true;

  // ── SOFT BLOCK — production domains only ─────────────────────────
  // On replit.dev (preview) we relax extra checks so dev isn't annoying.
  const isProd =
    !host.includes('localhost') &&
    !host.includes('127.0.0.1') &&
    !host.includes('replit.dev') &&
    !host.includes('replit.co');

  if (isProd) {
    // SEO/AI/archiver bots
    if (SOFT_BLOCK_UA.some(p => ua.includes(p))) return true;

    // Navigation fingerprint: real browsers ALWAYS send these three headers
    // for page navigations. Scrapers that spoof the UA usually miss sec-fetch-mode.
    const isNavRequest =
      url === '/' ||
      (accept.includes('text/html') && accept.includes('application/xhtml'));

    if (isNavRequest) {
      const hasBrowserFingerprint =
        req.headers['accept-language'] &&
        req.headers['accept-encoding'] &&
        req.headers['sec-fetch-mode'];
      if (!hasBrowserFingerprint) return true;
    }

    // Direct asset pulls without a browser Referer = likely a scraper
    // downloading individual files rather than browsing through the page.
    const isAssetReq = /\.(js|css|jsx|ts)(\?|$)/.test(url);
    if (isAssetReq && !req.headers['referer'] && !req.headers['sec-fetch-dest']) {
      return true;
    }
  }

  return false;
}

// ── The middleware factory ────────────────────────────────────────
function yamatoBotShieldMiddleware(req, res, next) {
  if (!isHostileClient(req)) { next(); return; }

  const ua = req.headers['user-agent'] || 'unknown';
  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '?';
  console.log(`[YAMATO] Blocked: ${ip} — UA: ${ua.slice(0, 80)}`);

  res.writeHead(403, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'X-Robots-Tag': 'noindex, noarchive, nosnippet, noodp, noimageindex',
    'X-Yamato-Shield': 'BLOCKED',
    'X-Frame-Options': 'DENY',
  });
  res.end(TROLL_HTML);
}

// ── Vite plugin that installs the middleware ──────────────────────
function yamatoBotShieldPlugin() {
  return {
    name: 'yamato-bot-shield',
    // Dev server
    configureServer(server) {
      server.middlewares.use(yamatoBotShieldMiddleware);
    },
    // Production preview server
    configurePreviewServer(server) {
      server.middlewares.use(yamatoBotShieldMiddleware);
    },
  };
}

// ══════════════════════════════════════════════════════════════════
export default defineConfig({
  plugins: [
    react(),

    // ── Bot shield runs FIRST (before static file serving) ──────
    yamatoBotShieldPlugin(),

    // ── JavaScript Obfuscation (build only) ──────────────────────
    obfuscator({
      include: [/src\/.*\.(js|jsx|ts|tsx)$/],
      exclude: [/node_modules/],
      apply: 'build',
      options: {
        compact: true,
        controlFlowFlattening: true,
        controlFlowFlatteningThreshold: 0.8,
        deadCodeInjection: true,
        deadCodeInjectionThreshold: 0.3,
        debugProtection: true,
        debugProtectionInterval: 4000,
        disableConsoleOutput: false,
        identifierNamesGenerator: 'mangled-shuffled',
        log: false,
        numbersToExpressions: true,
        renameGlobals: false,
        selfDefending: true,
        simplify: true,
        splitStrings: true,
        splitStringsChunkLength: 8,
        stringArray: true,
        stringArrayCallsTransform: true,
        stringArrayCallsTransformThreshold: 0.75,
        stringArrayEncoding: ['base64', 'rc4'],
        stringArrayIndexShift: true,
        stringArrayRotate: true,
        stringArrayShuffle: true,
        stringArrayWrappersCount: 3,
        stringArrayWrappersChainedCalls: true,
        stringArrayWrappersParametersMaxCount: 5,
        stringArrayWrappersType: 'function',
        stringArrayThreshold: 0.85,
        transformObjectKeys: true,
        unicodeEscapeSequence: false,
      },
    }),
  ],

  server: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: true,
  },

  build: {
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
        drop_debugger: false,
        passes: 3,
        unsafe: true,
        unsafe_math: true,
        unsafe_proto: true,
        pure_getters: true,
        toplevel: true,
        dead_code: true,
        evaluate: true,
        collapse_vars: true,
        sequences: true,
        booleans: true,
        conditionals: true,
        if_return: true,
        join_vars: true,
      },
      mangle: {
        toplevel: true,
        keep_fnames: false,
        properties: { regex: /^_private_/ },
      },
      output: {
        comments: false,
        ascii_only: true,
        beautify: false,
      },
    },
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[hash:20][extname]',
        chunkFileNames: 'assets/[hash:20].js',
        entryFileNames: 'assets/[hash:20].js',
        manualChunks(id) {
          if (!id.includes('node_modules')) return;
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) return 'v0';
          if (id.includes('framer-motion')) return 'v1';
          if (id.includes('firebase')) return 'v2';
          return 'v3';
        },
      },
      onwarn(warning, warn) {
        if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return;
        warn(warning);
      },
    },
    target: 'es2020',
    cssCodeSplit: true,
    reportCompressedSize: false,
    chunkSizeWarningLimit: 2000,
  },

  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'framer-motion'],
  },
});
