DOBUNZA PWA — VERSI SIAP DIPASANG DI HP

ISI
- File website Dobunza asli (HTML, CSS, JavaScript, foto, musik)
- manifest.webmanifest untuk identitas aplikasi
- service-worker.js untuk cache/offline dasar
- icons/ untuk ikon aplikasi

CARA MENJALANKAN
PWA perlu dijalankan dari HTTPS (atau localhost), bukan dengan membuka file index.html langsung.

CARA HOSTING GRATIS DENGAN GITHUB PAGES
1. Ekstrak ZIP ini.
2. Masuk/daftar di https://github.com
3. Buat repository baru, misalnya "dobunza", dan pilih Public.
4. Unggah semua ISI folder "Dobunza - backup" ke root repository (index.html harus berada di root, bukan di dalam folder tambahan).
5. Buka Settings > Pages.
6. Pada Build and deployment, pilih "Deploy from a branch", pilih branch "main" dan folder "/ (root)", lalu Save.
7. Tunggu hingga GitHub Pages memberi alamat website HTTPS.
8. Buka alamat itu di Chrome Android. Pilih menu ⋮ > "Install app" atau "Tambahkan ke layar utama".
9. Buka aplikasi Dobunza dari ikon di layar utama.

CARA UPDATE
Jika mengubah file website, unggah ulang file yang berubah ke repository GitHub. Jika update service worker, naikkan CACHE_NAME di service-worker.js (misalnya dobunza-pwa-v2) agar cache lama diganti.

CATATAN
- Hosting GitHub Pages gratis untuk repository public.
- PWA bisa dipasang tanpa Play Store.
- Cache offline dasar disertakan. Pemutaran musik offline bergantung pada apakah file musik sudah berhasil tersimpan di cache perangkat dan batas penyimpanan browser.
- Google Fonts memerlukan internet jika font belum tersimpan di browser.
- Halaman admin dan game ikut disertakan.
