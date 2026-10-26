DOBUNZA ADMIN — TAHAP 1 (LOGIN + DASHBOARD AWAL)

CARA MEMBUKA
1. Ekstrak ZIP.
2. Buka folder Dobunza-Fixed di VS Code.
3. Jalankan index.html, admin.html, dan admin-dashboard.html melalui Live Server dengan folder/server yang sama.
4. Buka admin.html terlebih dahulu.
5. Password awal: Dobunza2026!
6. Setelah masuk, halaman akan menuju admin-dashboard.html.

MENGGANTI PASSWORD
Buka admin.js dan ubah nilai ADMIN_PASSWORD. Contoh:
const ADMIN_PASSWORD = "password-baru-kamu";
Simpan file lalu muat ulang halaman.

PENTING
- Ini login sederhana di sisi browser, bukan autentikasi aman untuk website publik.
- Dashboard saat ini masih tahap tampilan awal. Fitur unggah/ganti/hapus foto belum aktif.
- Foto, musik, dan aset lain dari project asli tidak disertakan dalam ZIP ini. Salin folder aset dari project lama jika dibutuhkan.
- Untuk menghindari masalah sesi, buka admin.html dan admin-dashboard.html dari server Live Server yang sama, jangan mencampur alamat file:// dengan http://127.0.0.1.


FITUR KELOLA FOTO (VERSI INI)
1. Jalankan admin.html dengan Live Server di VS Code. Jangan buka menggunakan file://.
2. Login, masuk dashboard, lalu pilih foto dan tekan Simpan.
3. Untuk menambah foto gallery, gunakan tombol “Pilih foto” di bagian Tambah foto ke Gallery.
4. Buka index.html dengan Live Server pada alamat/port yang sama. Foto tersimpan di browser yang sama melalui IndexedDB.
5. Foto maksimal 15 MB per file. Simpan cadangan foto asli di komputer. Data tidak tersinkron otomatis ke browser atau perangkat lain.
6. Fitur ini hanya menyimpan foto pada browser lokal; password sisi browser bukan sistem keamanan server.


FITUR EDIT CERITA & TIMELINE
- Login melalui admin.html dengan Live Server.
- Buka menu Edit cerita & timeline di dashboard.
- Ubah label, judul, dan paragraf Our Story serta empat momen Timeline.
- Tekan Simpan perubahan, lalu muat ulang index.html untuk melihat teks baru.
- Tombol Kembalikan teks awal menghapus penggantian teks dan memakai tulisan default website.
- Teks disimpan secara lokal di IndexedDB browser yang sama, tidak mengubah file HTML asli.


FITUR TERBARU: MUSIK DAN TANGGAL HUBUNGAN
- Di dashboard, menu Kelola musik memungkinkan mengubah judul lagu dan menyimpan file audio (maksimal 25 MB). File musik disimpan di IndexedDB browser. Gunakan tombol "Gunakan musik asli" untuk kembali ke music/music.mp3.
- Menu Tanggal hubungan mengatur tanggal mulai untuk penghitung waktu dan hari jadi berikutnya. Nilai awal tetap 1 Desember 2023.
- Setelah menyimpan, muat ulang index.html melalui Live Server yang sama. Musik baru akan dipakai saat pengunjung menekan tombol musik; browser tidak dipaksa memutar audio otomatis.
- Semua data tetap lokal di browser/perangkat tersebut, bukan diunggah ke server.


PEMBARUAN: Header dashboard dan menu utama kini dibuat sticky agar tetap terlihat saat halaman digulir. Di layar HP, menu utama menjadi baris navigasi horizontal yang tetap berada di bawah header.


PEMBARUAN NAVIGASI: menu yang sedang dipilih akan diberi warna pink. Penanda mengikuti menu saat diklik dan saat menggulir bagian dashboard.

FITUR TAMBAHAN: Our Little Adventure
Buka game.html atau pilih menu "Our Games ♡" di website utama untuk memainkan game petualangan online dua pemain. Panduan lengkap ada di README-GAME.txt.
