# PROSES

## Persona dan masalahnya
Freelancer menerima bayaran per proyek, dan klien sering telat melunasi. Makanya yang perlu dicatat bukan cuma uang masuk dan keluar. Tagihan yang belum cair juga.

## Rancangan struktur data
Data dibagi dua daftar. Daftar pertama berisi transaksi, tiap satunya punya id, tanggal, jenis, kategori, nominal, dan catatan. Daftar kedua berisi tagihan dengan id, tanggal, klien, nominal, dan status yang isinya "belum dibayar" atau "lunas". localStorage menyimpan keduanya dengan kunci sendiri, dalam bentuk array JSON. Nominal selalu angka, tidak pernah teks berformat Rupiah. Saat tagihan lunas, aplikasi membuat satu transaksi pemasukan baru. Fitur khas tidak berdiri sendiri. Ia memakai data transaksi yang sama dengan daftar dan ringkasan.

## Keputusan desain
Keputusan yang paling berpengaruh: semua tampilan lewat satu fungsi render() yang hanya membaca state. Setiap aksi mengubah state, menyimpan, lalu memanggil render(). Sederhana alasannya. Kalau tiap aksi memperbarui tampilannya sendiri, mudah ada bagian yang lupa ikut berubah, misalnya saldo sudah benar tapi piutang masih angka lama.

## Bug dan kendala
setelah input nominal dibuat otomatis berformat Rupiah. Kalau mengetik di tengah angka, kursor lompat ke akhir. Perbaikannya butuh setSelectionRange, yang belum diajarkan.
