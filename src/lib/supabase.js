import { db, auth as firebaseAuth, storage as firebaseStorage, isFirebaseConfigured } from './firebase';
import {
  collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc, setDoc,
  doc, query, orderBy, limit as fbLimit, where
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

class QueryBuilder {
  constructor(colName) {
    this.colName = colName;
    this._constraints = [];
    this._isSingle = false;
    this._updateData = null;
    this._insertData = null;
    this._upsertData = null;
    this._deleteMode = false;
    this._eqField = null;
    this._eqValue = null;
  }

  select() { return this; }

  order(field, opts = {}) {
    this._constraints.push(orderBy(field, opts.ascending === false ? 'desc' : 'asc'));
    return this;
  }

  limit(n) {
    this._constraints.push(fbLimit(n));
    return this;
  }

  eq(field, value) {
    this._eqField = field;
    this._eqValue = value;
    if (field !== 'id') {
      this._constraints.push(where(field, '==', value));
    }
    return this;
  }

  single() {
    this._isSingle = true;
    return this._execute();
  }

  update(data) {
    this._updateData = data;
    return this;
  }

  insert(dataArr) {
    this._insertData = dataArr;
    return this._execute();
  }

  upsert(dataArr) {
    this._upsertData = dataArr;
    return this._execute();
  }

  delete() {
    this._deleteMode = true;
    return this;
  }

  then(onFulfilled, onRejected) {
    return this._execute().then(onFulfilled, onRejected);
  }

  catch(onRejected) {
    return this._execute().catch(onRejected);
  }

  async _execute() {
    if (!isFirebaseConfigured || !db) {
      return { data: null, error: null };
    }

    try {
      if (this._insertData) {
        for (const item of this._insertData) {
          const { id, ...rest } = item;
          rest.created_at = rest.created_at || new Date().toISOString();
          const docRef = await addDoc(collection(db, this.colName), rest);
          rest.id = docRef.id;
        }
        return { data: this._insertData, error: null };
      }

      if (this._upsertData) {
        for (const item of this._upsertData) {
          const { id, ...rest } = item;
          const docId = id === 1 || id === '1' ? 'main' : (String(id) || 'main');
          await setDoc(doc(db, this.colName, docId), rest, { merge: true });
        }
        return { data: this._upsertData, error: null };
      }

      if (this._updateData) {
        if (this._eqField === 'id') {
          const docId = this._eqValue === 1 || this._eqValue === '1' ? 'main' : String(this._eqValue);
          const docRef = doc(db, this.colName, docId);
          await updateDoc(docRef, this._updateData);
        } else if (this._eqField) {
          const colRef = collection(db, this.colName);
          const q = query(colRef, where(this._eqField, '==', this._eqValue));
          const snap = await getDocs(q);
          for (const d of snap.docs) {
            await updateDoc(d.ref, this._updateData);
          }
        }
        return { data: null, error: null };
      }

      if (this._deleteMode) {
        if (this._eqField === 'id') {
          const docId = String(this._eqValue);
          await deleteDoc(doc(db, this.colName, docId));
        } else if (this._eqField) {
          const colRef = collection(db, this.colName);
          const q = query(colRef, where(this._eqField, '==', this._eqValue));
          const snap = await getDocs(q);
          for (const d of snap.docs) {
            await deleteDoc(d.ref);
          }
        }
        return { data: null, error: null };
      }

      if (this._isSingle) {
        if (this.colName === 'settings') {
          const docId = this._eqField === 'id' ? String(this._eqValue) : 'main';
          const docRef = doc(db, this.colName, docId);
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            return { data: { id: snap.id, ...snap.data() }, error: null };
          }
          const colRef = collection(db, this.colName);
          const allSnap = await getDocs(colRef);
          if (!allSnap.empty) {
            const d = allSnap.docs[0];
            return { data: { id: d.id, ...d.data() }, error: null };
          }
          return { data: null, error: { code: 'PGRST116', message: 'Not found' } };
        }

        if (this._eqField === 'id') {
          const docRef = doc(db, this.colName, String(this._eqValue));
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            return { data: { id: snap.id, ...snap.data() }, error: null };
          }
          return { data: null, error: { code: 'PGRST116', message: 'Not found' } };
        }

        const colRef = collection(db, this.colName);
        const q = query(colRef, ...this._constraints);
        const snap = await getDocs(q);
        if (!snap.empty) {
          const d = snap.docs[0];
          return { data: { id: d.id, ...d.data() }, error: null };
        }
        return { data: null, error: { code: 'PGRST116', message: 'Not found' } };
      }

      const colRef = collection(db, this.colName);
      const q = this._constraints.length > 0 ? query(colRef, ...this._constraints) : colRef;
      const snap = await getDocs(q);
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      return { data, error: null };

    } catch (err) {
      return { data: null, error: { message: err.message } };
    }
  }
}

const mockStorage = {
  from: () => ({
    upload: async () => ({ error: new Error('Firebase not configured') }),
    getPublicUrl: () => ({ data: { publicUrl: '' } }),
  }),
};

const firebaseStorageClient = {
  from: (bucket) => ({
    upload: async (fileName, file) => {
      try {
        const storageRef = ref(firebaseStorage, `${bucket}/${fileName}`);
        await uploadBytes(storageRef, file);
        return { error: null };
      } catch (err) {
        return { error: { message: err.message } };
      }
    },
    getPublicUrl: (fileName) => {
      const storageRef = ref(firebaseStorage, `${bucket}/${fileName}`);
      return { data: { publicUrl: `https://firebasestorage.googleapis.com/v0/b/${import.meta.env.VITE_FIREBASE_STORAGE_BUCKET}/o/${encodeURIComponent(bucket + '/' + fileName)}?alt=media` } };
    },
  }),
};

const mockAuth = {
  getSession: async () => ({ data: { session: null }, error: null }),
  onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  signInWithPassword: async () => ({ data: null, error: new Error('Firebase not configured. Add VITE_FIREBASE_* env vars.') }),
  signOut: async () => ({ error: null }),
};

export const supabase = {
  from: (colName) => new QueryBuilder(colName),
  storage: isFirebaseConfigured ? firebaseStorageClient : mockStorage,
  auth: mockAuth,
};
