/* Applies locally saved music settings from the Dobunza Admin dashboard. */
(() => {
  const DB_NAME = 'dobunza-local-media';
  const STORE_NAME = 'photos';
  function openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => { if (!request.result.objectStoreNames.contains(STORE_NAME)) request.result.createObjectStore(STORE_NAME, { keyPath: 'key' }); };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  async function getMusic() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const request = tx.objectStore(STORE_NAME).get('settings:music');
      request.onsuccess = () => { db.close(); resolve(request.result || null); };
      request.onerror = () => { db.close(); reject(request.error); };
    });
  }
  const title = document.getElementById('music-title');
  if (title) title.textContent = localStorage.getItem('dobunzaMusicTitle') || 'A Little Memory';
  const audio = document.getElementById('background-music');
  if (audio) getMusic().then(record => {
    if (record && record.blob instanceof Blob) {
      const source = audio.querySelector('source');
      if (source) source.remove();
      audio.src = URL.createObjectURL(record.blob);
      audio.load();
    }
  }).catch(error => console.warn('Dobunza: musik tersimpan tidak dapat dimuat.', error));
})();
