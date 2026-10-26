/* Dobunza text storage bridge: applies story/timeline text saved in the local admin dashboard. */
(() => {
  const DB_NAME = 'dobunza-local-media';
  const STORE_NAME = 'photos';
  const DEFAULTS = {
    'story-date': 'The Beginning',
    'story-heading': 'A Small Moment, A Beautiful Journey',
    'story-paragraph-1': 'Semua cerita besar selalu dimulai dari sebuah momen sederhana. Dari tawa kecil, percakapan panjang, dan waktu yang perlahan membuat kita semakin mengenal satu sama lain.',
    'story-paragraph-2': 'Dobunza menjadi ruang kecil untuk menyimpan setiap perjalanan, kenangan, dan cerita yang kita bangun bersama.',
    'timeline-1-label': 'First Chapter', 'timeline-1-title': 'Where It Started', 'timeline-1-description': 'Sebuah awal sederhana yang tanpa kita sadari menjadi cerita yang sangat berarti.',
    'timeline-2-label': 'Beautiful Days', 'timeline-2-title': 'Growing Together', 'timeline-2-description': 'Hari demi hari membuat kita semakin mengenal, memahami, dan menghargai satu sama lain.',
    'timeline-3-label': 'Precious Memory', 'timeline-3-title': 'Moments We Keep', 'timeline-3-description': 'Setiap foto, tawa, dan perjalanan menjadi bagian dari cerita kita.',
    'timeline-4-label': 'Today', 'timeline-4-title': 'Still Choosing You', 'timeline-4-description': 'Dan perjalanan ini masih terus berjalan dengan banyak cerita baru.'
  };
  function openDB() {
    return new Promise((resolve, reject) => {
      if (!('indexedDB' in window)) return reject(new Error('IndexedDB tidak tersedia'));
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => { if (!request.result.objectStoreNames.contains(STORE_NAME)) request.result.createObjectStore(STORE_NAME, { keyPath: 'key' }); };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  async function readAll() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const request = tx.objectStore(STORE_NAME).getAll();
      request.onsuccess = () => { db.close(); resolve(request.result || []); };
      request.onerror = () => { db.close(); reject(request.error); };
    });
  }
  readAll().then(records => {
    const values = new Map(records.filter(record => typeof record.key === 'string' && record.key.startsWith('content:')).map(record => [record.key.slice(8), record.value]));
    document.querySelectorAll('[data-dobunza-text]').forEach(element => {
      const key = element.dataset.dobunzaText;
      const value = values.has(key) ? values.get(key) : DEFAULTS[key];
      if (typeof value === 'string') element.textContent = value;
    });
  }).catch(error => console.warn('Dobunza: teks tersimpan belum dapat dibaca.', error));
})();
