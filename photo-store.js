/* Dobunza photo storage bridge: reads photos uploaded from the local admin dashboard. */
(() => {
  const DB_NAME = 'dobunza-local-media';
  const STORE_NAME = 'photos';
  function openDB() {
    return new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) return reject(new Error('Browser tidak mendukung IndexedDB.'));
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  async function readPhotos() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).getAll();
      req.onsuccess = () => { db.close(); resolve(req.result || []); };
      req.onerror = () => { db.close(); reject(req.error); };
    });
  }
  function makeURL(blob) { return URL.createObjectURL(blob); }
  readPhotos().then(records => {
    const byKey = new Map(records.map(record => [record.key, record]));
    document.querySelectorAll('img[data-dobunza-key]').forEach(img => {
      const record = byKey.get(img.dataset.dobunzaKey);
      if (record && record.blob) {
        const previous = img.dataset.objectUrl;
        if (previous) URL.revokeObjectURL(previous);
        const url = makeURL(record.blob);
        img.src = url;
        img.dataset.objectUrl = url;
      }
    });
    const grid = document.querySelector('.gallery-grid');
    if (grid) {
      records.filter(record => record.key.startsWith('gallery-extra-')).sort((a,b) => a.key.localeCompare(b.key)).forEach(record => {
        if (!record.blob) return;
        const item = document.createElement('div');
        item.className = 'gallery-item dobunza-added-gallery-item';
        const img = document.createElement('img');
        img.src = makeURL(record.blob); img.alt = record.name || 'Kenangan tambahan';
        const overlay = document.createElement('div'); overlay.className = 'gallery-overlay'; overlay.textContent = record.caption || 'Our Memory';
        item.append(img, overlay); grid.appendChild(item);
      });
    }
  }).catch(error => console.warn('Dobunza: foto tersimpan belum dapat dibaca.', error));
})();
