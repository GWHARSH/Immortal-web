// ══════════════════════════════════════════════════════════════════
//  IMMORTAL CLOUD MEDIA STORAGE ENGINE
//  Uploads media files (videos, audio, banners) to public cloud storage
//  so EVERY visitor worldwide can stream background videos and music
//  on any device (mobile, desktop, tablet).
// ══════════════════════════════════════════════════════════════════

import { storage as firebaseStorage, isFirebaseConfigured } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { realSupabase } from './supabase';
import { saveMediaToIDB } from './mediaStore';

/**
 * Uploads a file to public cloud storage.
 * Strategy:
 * 1. Firebase Storage (Primary - global CDN public download URL)
 * 2. Supabase Storage (Secondary)
 * 3. Catbox Public CDN (Tertiary free public media host)
 * 4. Local IndexedDB fallback (Local preview fallback)
 */
export async function uploadMediaFile(file, folder = 'uploads') {
  if (!file) throw new Error('No file provided');

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const fileName = `${Date.now()}_${safeName}`;
  const filePath = `${folder}/${fileName}`;

  // ── Strategy 1: Firebase Storage (Public CDN) ────────────────────
  if (isFirebaseConfigured && firebaseStorage) {
    try {
      console.log('[CloudStorage] Uploading to Firebase Storage:', filePath);
      const storageRef = ref(firebaseStorage, filePath);
      await uploadBytes(storageRef, file, {
        contentType: file.type || 'application/octet-stream',
      });
      const publicUrl = await getDownloadURL(storageRef);
      if (publicUrl) {
        console.log('[CloudStorage] Firebase Storage success:', publicUrl);
        return publicUrl;
      }
    } catch (err) {
      console.warn('[CloudStorage] Firebase Storage upload notice:', err?.message || err);
    }
  }

  // ── Strategy 2: Supabase Storage ─────────────────────────────────
  try {
    console.log('[CloudStorage] Uploading to Supabase Storage:', filePath);
    const { error: sbErr } = await realSupabase.storage
      .from('files')
      .upload(filePath, file, { cacheControl: '3600', upsert: true });

    if (!sbErr) {
      const { data } = realSupabase.storage.from('files').getPublicUrl(filePath);
      if (data?.publicUrl) {
        console.log('[CloudStorage] Supabase Storage success:', data.publicUrl);
        return data.publicUrl;
      }
    }
  } catch (sbEx) {
    console.warn('[CloudStorage] Supabase Storage upload notice:', sbEx?.message || sbEx);
  }

  // ── Strategy 3: Catbox Public Media CDN ─────────────────────────
  try {
    console.log('[CloudStorage] Uploading to Catbox Public CDN...');
    const formData = new FormData();
    formData.append('reqtype', 'fileupload');
    formData.append('fileToUpload', file);

    const res = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      const catboxUrl = (await res.text()).trim();
      if (catboxUrl && catboxUrl.startsWith('http')) {
        console.log('[CloudStorage] Catbox CDN success:', catboxUrl);
        return catboxUrl;
      }
    }
  } catch (cbErr) {
    console.warn('[CloudStorage] Catbox CDN upload notice:', cbErr?.message || cbErr);
  }

  // ── Strategy 4: Local IndexedDB Fallback ─────────────────────────
  console.warn('[CloudStorage] Falling back to IndexedDB local storage');
  const idbRef = await saveMediaToIDB(folder, file);
  return idbRef;
}
