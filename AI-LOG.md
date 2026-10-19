# AI-LOG

AI yang dipakai Claude.

## Simpan array objek ke localStorage
- Prompt: gimana cara nyimpen array objek ke localStorage terus baca lagi pas load, tapi ngga crash kalau isinya JSON rusak?
- Dipakai: `simpanData()` (JSON.stringify) dan `muatData()` (JSON.parse di try/catch, hasilnya dicek Array.isArray).
- Diubah: tidak ada, polanya sama dengan `muatDaftarBacaan()` di m06.

## Hapus pakai event delegation + konfirmasi
- Prompt: tombol hapus dibikin ulang tiap render, jadi listener-nya ditaruh di mana? Konfirmasinya tanpa confirm() bisa gimana?
- Dipakai: satu listener click di #daftar-transaksi, cari tombol pakai `closest('[data-aksi]')`. Konfirmasi lewat `state.hapusId`, barisnya berubah jadi "Hapus transaksi ini?" dengan Ya dan Batal.
- Diubah: tidak ada.

## Tagihan lunas otomatis jadi pemasukan
- Prompt: tagihan klien statusnya belum dibayar/lunas. Pas ditandai lunas, otomatis nambah transaksi pemasukan, terus total piutang dihitung dari yang belum lunas.
- Dipakai: `tandaiLunas()` (ubah status, push transaksi pemasukan) dan penjumlahan piutang di `hitungRingkasan()`.
- Diubah: tidak ada. Tanggal pemasukan ikut tanggal tagihan karena new Date() belum diajarkan.

## Filter jenis, kategori, tan
- Prompt: filter dengan 4 kondisi sekaligus, kalau salah satu kosong berarti dilewati.
Gimana nulisnya biar nggak rib
- Dipakai: `saringTransaksi()` (filter dengan kondisi `!filter.x || ...`) dan satu
listener input di #filter, nami `state.filter`.
- Diubah: tidak ada.

## Input nominal berformat Rupiah
- Prompt: input uang jangan ty jadi "Rp 1.500.000" pasngetik, tapi yang disimpan tetap angka.
- Dipakai: `ambilAngka()` (ambputUang()` yang memanggil`formatRupiah()`.
- Diubah: kursor lompat ke akhka, dibiarkan karenasetSelectionRange belum diajarkan.
