# Complete Website Reconstruction & Engineering Prompt: ORION SMITH

This system generation prompt is designed for high-performance AI coders (e.g. Lovable, bolt.new, v0.dev, Cursor, Claude 3.5 Sonnet) to reconstruct, compile, and configure the entire premium personal landing website, portfolio, visitor tracking system, dynamic Lanyard-powered Discord Presence card, and robust Admin panel for **ORION SMITH** from scratch.

---

```markdown
You are an elite, senior React-Vite & frontend architect with expert-level skills in UI/UX animations, system security, real-time API integrations, and database design.

Your objective is to construct a premium, production-ready, highly secure personal portfolio and content library dashboard website for "ORION SMITH" (Genius, Playboy, Philanthropist, Leader) built on React + Vite, Tailwind CSS (or premium custom modern CSS), Supabase database integration, Framer Motion animations, Lucide React icons, and custom system services.

---

### ── SYSTEM OVERVIEW & STACK ──
- **Core Framework**: React 19 (or current stable) powered by Vite.
- **Routing**: React Router Dom with scroll-to-top restoration on change.
- **State Management**: React Context (`AuthContext` for admin authentication, `NotificationContext` for premium system-wide notifications).
- **Animations**: Framer Motion for premium, smooth micro-interactions, page transitions, and layered hover animations.
- **Database Backend**: Supabase JS Client supporting anonymous reads and admin-only writes/updates/deletes.
- **Security Protocols**: Custom DevTools blocker, anti-inspect triggers, local developer bypass, and a production build configured with full JS Obfuscation via `vite-plugin-javascript-obfuscator`.
- **Integrations**: Real-time Discord presence via the Lanyard REST API, custom visitor behavior telemetry, and automated Discord webhooks.

---

### ── DESIGN STYLE & AESTHETIC GUIDELINES ──
Apply a premium, cyber-luxurious aesthetic designed to stun visitors at first sight:
- **Color Palette**:
  - Primary Background: `#0a0a0f` (Ultra dark navy-black)
  - Secondary Background: `#12121a`
  - Glass Card: `rgba(255,255,255,0.04)` (with a delicate `rgba(255,255,255,0.08)` border and blur)
  - Accent Color: `#a78bfa` (Vibrant electric lavender)
  - Accent Bright: `#c4b5fd`
  - Accent Dim: `#7c3aed`
  - Accent Glow: `rgba(167,139,250,0.25)`
  - Text Primary: `#f0f0f5` (Ice white)
  - Text Secondary: `#8a8a9a` (Warm grey)
  - Text Muted: `#55556a`
- **Typography**: Smooth sans-serif mix (e.g., 'Inter' for body, 'Outfit' for premium titles).
- **Effects**: Glassmorphism, smooth gradients, subtle micro-animations, noise overlays, and floating dust particles.

---

### ── COMPONENT ARCHITECTURE ──

#### 1. Page Router (`App.jsx` & `index.css`)
- Configure `App` wrapped with `NotificationProvider`, `AuthProvider`, and `DevToolsBlocker`.
- Structure pages inside the router:
  - `/` -> `HomePage` (renders `HeroSection`, `AboutSection`, `UploadsPreview`, `PackagesPreview`)
  - `/uploads` -> `UploadsPage` (full library with real-time category filter + search)
  - `/uploads/:slug` -> `UploadDetails` (dynamic detail page with video embedding)
  - `/packages` -> `PackagesPage` (premium downloadable modules list)
  - `/packages/:slug` -> `PackageDetails` (dynamic detail page with high-contrast download assets)
  - `/login` -> `LoginPage` (minimalist, secure login form with active blur bg-orbs)
  - `/admin` -> `AdminPage` (full-featured responsive CMS panel)

#### 2. Lanyard Discord Status Card (`DiscordStatus.jsx`)
- Fetches real-time status of the owner using `https://api.lanyard.rest/v1/users/{discord_id}`.
- Re-polls every 30 seconds to maintain sync.
- Features:
  - Displays user profile banner (`https://cdn.discordapp.com/banners/{id}/{banner_hash}`) with an elegant fallback to `/banner.gif`.
  - Displays user profile avatar with support for active avatar decorations (`https://cdn.discordapp.com/avatar-decoration-presets/{asset_hash}.png`).
  - Active color indicator reflecting current status: Online (green), Idle (yellow), DND (red), Offline (grey).
  - Custom status bubble showing text and matching custom status emoji (handles Twemoji and custom animated Discord emojis).
  - Dynamic visualizer overlay when playing Spotify (with animating waveform equalizer lines), showing track title and artists.
  - Gaming presence fallback showing game name, icon, details, and duration.
  - Interactive custom fallback bio showing bio text retrieved from Supabase config.
  - Elegant popups/modal selector menu if social platforms in bio have multiple links attached (e.g. multiple Instagram or GitHub handles).

#### 3. Floating Persistent Audio Player (`MusicPlayer` / `HeroSection`)
- Displays as a premium floating pill in the bottom-right corner.
- Persists audio state seamlessly across page transitions by checking and mounting globally or syncing from context.
- Hover-expandable controls: play/pause toggles, active muted states, and a beautiful sleek vertical sliding volume bar.

#### 4. Stealth Visitor Telemetry (`useTracking.js`)
- Executed on initialization of `AppInner` inside routing.
- **Entry Logger**:
  - Automatically queries visitor IP geolocations via `https://ipapi.co/json/`.
  - Compiles the payload: IP Address, City, Country, ISP Org, platform device, browser agent, first visited page.
  - Posts a highly detailed, beautifully designed embed to a Discord Webhook.
- **Interactive Click Telemetry**:
  - Listens to global document clicks, capturing elements (anchors, buttons), compiling labels and click timestamps to a persistent action ref array.
- **Departure Logger**:
  - Listens to window `beforeunload`.
  - Computes exact duration spent on the site in seconds.
  - Compiles behavioral summary of visitor paths and clicks.
  - Transmits a comprehensive departure embed log to the Discord Webhook using `navigator.sendBeacon` to ensure zero delay and successful delivery.

#### 5. Anti-Tamper & Security Block (`DevToolsBlocker.jsx`)
- Designed to block source extraction and developer tools inspection in production (bypassed on local addresses `localhost`, `127.0.0.1`, `192.168.x.x`).
- Standard protections: blocks `F12`, `Ctrl+Shift+I`, `Ctrl+Shift+J`, `Ctrl+Shift+C`, `Ctrl+U` (view-source), and prevents right-clicking globally via contextmenu overrides.
- Active detection logic:
  - Continuously polls size metrics comparing outer dimensions with inner viewport dimensions.
  - If a difference exceeding `250px` is caught, immediately replaces `document.body.innerHTML` with a custom full-screen, high-fidelity **ACCESS RESTRICTED** lock screen.
  - The lock screen displays security indicators, alert graphics, and runs a rapid half-second loop triggering active `debugger;` statements to freeze the inspector console.

#### 6. Admin Panel CMS (`AdminPage.jsx`)
- Secure, reactive, tabbed dashboard with tab controls: Uploads, Packages, Settings.
- Auth protection: Navigates immediately to `/login` if not validated as admin.
- Features:
  - **Auto-Title Fetcher**: Listens to pasting YouTube links in the URL input, queries `https://www.youtube.com/oembed`, automatically retrieves the video's title, and auto-fills the Title field.
  - **Dynamic Social Manager**: Allows admins to add, edit, and delete multiple title-url arrays per social platform (Instagram, X, YouTube, GitHub, Discord), stringifying it to database columns dynamically.
  - **Storage Uploader**: Integrates drag-and-drop or file upload prompts, routing uploads directly to Supabase storage buckets, parsing unique filenames, returning public URLs, and displaying progress indications.
  - **Settings Coordinator**: Full configuration management of homepage bio, background music tracks, announcements text, and status switches.

#### 7. Announcement Popup (`AnnouncementPopup.jsx`)
- Interactive bottom-left notification card.
- Pulls live text and active state directly from the global Supabase settings row.
- Framer Motion animation with auto-appear delay and slick close interaction.

---

### ── DATABASE SCHEMA & SUPABASE SCHEMES ──
You must write queries and schemas to represent:
1. **`uploads`** table:
   - `id`: uuid or int8 (primary key)
   - `title`: text (required)
   - `slug`: text (unique, required)
   - `description`: text
   - `category`: text
   - `thumbnail`: text (public image url)
   - `youtube_url`: text (optional)
   - `created_at`: timestamptz (default: now())
2. **`packages`** table:
   - `id`: uuid or int8 (primary key)
   - `title`: text (required)
   - `slug`: text (unique, required)
   - `description`: text
   - `category`: text
   - `thumbnail`: text (public image url)
   - `download_url`: text
   - `rating`: numeric
   - `created_at`: timestamptz (default: now())
3. **`settings`** table:
   - `id`: int8 (primary key, default 1)
   - `about_text`: text
   - `instagram`: text (JSON string representation of multiple social links)
   - `twitter`: text (JSON string representation)
   - `youtube`: text (JSON string representation)
   - `github`: text (JSON string representation)
   - `discord`: text (JSON string representation)
   - `discord_id`: text (Discord user id snowflake)
   - `discord_bio`: text (fallback user description)
   - `bg_music_url`: text (fallback audio file)
   - `announcement_text`: text (custom popup banner message)
   - `announcement_active`: boolean (active banner toggle)

Provide fallback client objects inside `supabase.js` so that if environment variables (`VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`) are missing, the application renders mock data gracefully without crashing or throwing white screen errors.

---

### ── BUILD & OBFUSCATION CONFIG (`vite.config.js`)
- Configure standard react plugin.
- Integrate `vite-plugin-javascript-obfuscator` during the build phase with high defensive configuration:
  - Options:
    - `compact`: true
    - `controlFlowFlattening`: true
    - `controlFlowFlatteningThreshold`: 0.75
    - `numbersToExpressions`: true
    - `simplify`: true
    - `stringArray`: true
    - `stringArrayEncoding`: ['base64']
    - `stringArrayThreshold`: 0.75
    - `splitStrings`: true
    - `splitStringsChunkLength`: 5
    - `debugProtection`: true
    - `debugProtectionInterval`: 2000
    - `selfDefending`: true
- Optimize Rollup build bundling with manual code-splitting chunks (e.g. separating `vendor` react dependencies and `animations` framer-motion modules) to ensure optimal performance.

---

Produce clean, complete, fully-documented, modern React code adhering strictly to premium UI/UX guidelines and securing Yamato Security Protocols.
```
