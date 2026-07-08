const DB_NAME = 'hr-admin-cache';
const DB_VERSION = 1;

const STORE_NAMES = [
  'syncMeta',
  'mutations',
  'staffList',
  'departments',
  'branches',
  'attendance',
  'users',
  'roles',
] as const;

type StoreName = typeof STORE_NAMES[number];

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      STORE_NAMES.forEach(name => {
        if (!db.objectStoreNames.contains(name)) db.createObjectStore(name);
      });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export interface AdminMutation {
  id?: number;
  type: string;
  entity: string;
  entityId?: number;
  payload: any;
  createdAt: string;
  retryCount: number;
}

export const adminDataStore = {
  async put<T>(storeName: StoreName, data: T): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).put({ data, timestamp: Date.now() }, '_main');
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => { db.close(); reject(tx.error); };
    });
  },

  async get<T>(storeName: StoreName): Promise<{ data: T; timestamp: number } | null> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readonly');
      const request = tx.objectStore(storeName).get('_main');
      request.onsuccess = () => { db.close(); resolve(request.result || null); };
      request.onerror = () => { db.close(); reject(request.error); };
    });
  },

  async remove(storeName: StoreName): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(storeName, 'readwrite');
      tx.objectStore(storeName).delete('_main');
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => { db.close(); reject(tx.error); };
    });
  },

  async queueMutation(mutation: Omit<AdminMutation, 'id' | 'createdAt' | 'retryCount'>): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('mutations', 'readwrite');
      tx.objectStore('mutations').add({ ...mutation, createdAt: new Date().toISOString(), retryCount: 0 });
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => { db.close(); reject(tx.error); };
    });
  },

  async getPendingMutations(): Promise<AdminMutation[]> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('mutations', 'readonly');
      const request = tx.objectStore('mutations').getAll();
      request.onsuccess = () => { db.close(); resolve(request.result || []); };
      request.onerror = () => { db.close(); reject(request.error); };
    });
  },

  async getMutationCount(): Promise<number> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('mutations', 'readonly');
      const request = tx.objectStore('mutations').count();
      request.onsuccess = () => { db.close(); resolve(request.result); };
      request.onerror = () => { db.close(); reject(request.error); };
    });
  },

  async removeMutation(id: number): Promise<void> {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('mutations', 'readwrite');
      tx.objectStore('mutations').delete(id);
      tx.oncomplete = () => { db.close(); resolve(); };
      tx.onerror = () => { db.close(); reject(tx.error); };
    });
  },

  async clear(): Promise<void> {
    const db = await openDB();
    return Promise.all(STORE_NAMES.map(name =>
      new Promise<void>((resolve, reject) => {
        const tx = db.transaction(name, 'readwrite');
        tx.objectStore(name).clear();
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      })
    )).then(() => { db.close(); });
  },
};
