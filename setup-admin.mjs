// Setup script: creates settings doc + ensures admin user role
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, updatePassword } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

const ADMIN_EMAIL = 'hixx@playz.com';
const ADMIN_CURRENT_PASSWORD = 'hixx@2026';
const ADMIN_NEW_PASSWORD = 'immortal@1';

function loadEnv() {
  const envPath = path.resolve('.env');
  const env = {};
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        const value = (match[2] || '').trim().replace(/^['"]|['"]$/g, '');
        env[key] = value;
      }
    }
  }
  return env;
}

const env = loadEnv();

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function setup() {
  console.log('[SETUP] Signing in as admin...');

  try {
    const cred = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_CURRENT_PASSWORD);
    const uid = cred.user.uid;
    console.log('[SETUP] ✓ Signed in — UID:', uid);

    // Rotate admin password to the new credential
    if (ADMIN_NEW_PASSWORD && ADMIN_NEW_PASSWORD !== ADMIN_CURRENT_PASSWORD) {
      await updatePassword(cred.user, ADMIN_NEW_PASSWORD);
      console.log('[SETUP] ✓ Admin password updated to the new secret.');
    }

    // Set admin role
    await setDoc(doc(db, 'users', uid), {
      email: ADMIN_EMAIL,
      role: 'admin',
      created_at: new Date().toISOString(),
    }, { merge: true });
    console.log('[SETUP] ✓ Admin role set in users/' + uid);

    // Create settings document
    await setDoc(doc(db, 'settings', 'main'), {
      site_name: 'HIx playz',
      hero_title: 'HIx playz',
      hero_description: 'Official portfolio of HIx playz, the legendary immortal from demi gods. Explore uploads, custom gaming packages, and media from the demigods clan.',
      hero_eyebrow: 'Immortal from Demi Gods - Demigods Clan Leader',
      about_text: 'HIx playz is a prominent gaming portfolio and custom asset creator representing the legendary immortal demi gods / demigods clan.',
      instagram: '[]',
      twitter: '[]',
      youtube: '[]',
      github: '[]',
      discord: '[]',
      discord_id: '',
      discord_bio: '',
      bg_music_url: '/bg-music.mp3',
      seo_logo_url: '',
      announcement_text: '',
      announcement_active: false,
    }, { merge: true });
    console.log('[SETUP] ✓ Settings document created/updated');

    console.log('\n══════════════════════════════════════');
    console.log('  SETUP COMPLETE!');
    console.log(`  Login: ${ADMIN_EMAIL} / ${ADMIN_NEW_PASSWORD}`);
    console.log('══════════════════════════════════════\n');

    setTimeout(() => process.exit(0), 1000);
  } catch (err) {
    console.error('[SETUP] Error:', err.message);
    setTimeout(() => process.exit(1), 1000);
  }
}

setup();
