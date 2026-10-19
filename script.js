const KUNCI_TRANSAKSI = 'ets-keuangan:transaksi';
const KATEGORI = ['Proyek', 'Makan', 'Transport', 'Peralatan', 'Lainnya'];

const state = {
  transaksi: [],
  hapusId: null,
};

function elemen(selector) {
  return document.querySelector(selector);
}

function formatRupiah(angka) {
  return 'Rp ' + angka.toLocaleString('id-ID');
}

function muatData(kunci) {
  try {
    const hasil = JSON.parse(localStorage.getItem(kunci));
    return Array.isArray(hasil) ? hasil : [];
  } catch {
    return [];
  }
}

function simpanData() {
  localStorage.setItem(KUNCI_TRANSAKSI, JSON.stringify(state.transaksi));
}

function buatId() {
  let terbesar = 0;
  for (const item of state.transaksi) {
    if (item.id > terbesar) terbesar = item.id;
  }
  return terbesar + 1;
}

function hitungRingkasan() {
  let pemasukan = 0;
  let pengeluaran = 0;
  for (const transaksi of state.transaksi) {
    if (transaksi.jenis === 'pemasukan') pemasukan += transaksi.nominal;
    else pengeluaran += transaksi.nominal;
  }
  return { pemasukan, pengeluaran, saldo: pemasukan - pengeluaran };
}

function bandingkanTerbaru(a, b) {
  if (a.tanggal === b.tanggal) return b.id - a.id;
  return a.tanggal < b.tanggal ? 1 : -1;
}

function validasiTransaksi(data) {
  if (!data.tanggal) return 'Tanggal wajib diisi.';
  if (!(data.nominal > 0)) return 'Nominal harus lebih dari 0.';
  return '';
}

function tampilkanError(selector, pesan) {
  elemen(selector).textContent = pesan;
}

function buatTombol(teks, aksi, id) {
  const tombol = document.createElement('button');
  tombol.type = 'button';
  tombol.textContent = teks;
  tombol.dataset.aksi = aksi;
  tombol.dataset.id = String(id);
  return tombol;
}

function buatPesanKosong(teks) {
  const kosong = document.createElement('li');
  kosong.textContent = teks;
  return kosong;
}

function buatAksiTransaksi(transaksi) {
  if (state.hapusId !== transaksi.id) {
    return [buatTombol('Hapus', 'hapus', transaksi.id)];
  }
  const tanya = document.createElement('span');
  tanya.textContent = 'Hapus transaksi ini?';
  return [tanya, buatTombol('Ya', 'ya-hapus', transaksi.id), buatTombol('Batal', 'batal-hapus', transaksi.id)];
}

function buatItemTransaksi(transaksi) {
  const item = document.createElement('li');

  const info = document.createElement('span');
  const catatan = transaksi.catatan ? ` · ${transaksi.catatan}` : '';
  info.textContent = `${transaksi.tanggal} · ${transaksi.kategori}${catatan}`;

  const nominal = document.createElement('strong');
  const tanda = transaksi.jenis === 'pemasukan' ? '+ ' : '− ';
  nominal.className = transaksi.jenis;
  nominal.textContent = tanda + formatRupiah(transaksi.nominal);

  item.append(info, nominal, ...buatAksiTransaksi(transaksi));
  return item;
}

function renderRingkasan() {
  const ringkasan = hitungRingkasan();
  elemen('#total-pemasukan').textContent = formatRupiah(ringkasan.pemasukan);
  elemen('#total-pengeluaran').textContent = formatRupiah(ringkasan.pengeluaran);
  elemen('#saldo').textContent = formatRupiah(ringkasan.saldo);
}

function renderDaftar() {
  const daftar = [...state.transaksi].sort(bandingkanTerbaru);
  const wadah = elemen('#daftar-transaksi');
  if (daftar.length === 0) {
    wadah.replaceChildren(buatPesanKosong('Belum ada transaksi yang cocok.'));
    return;
  }
  wadah.replaceChildren(...daftar.map(buatItemTransaksi));
}

function render() {
  renderRingkasan();
  renderDaftar();
}

function ambilDataTransaksi() {
  return {
    tanggal: elemen('#input-tanggal').value,
    jenis: elemen('#input-jenis').value,
    kategori: elemen('#input-kategori').value,
    nominal: Number(elemen('#input-nominal').value),
    catatan: elemen('#input-catatan').value,
  };
}

function kosongkanFormTransaksi() {
  elemen('#input-tanggal').value = '';
  elemen('#input-nominal').value = '';
  elemen('#input-catatan').value = '';
}

function simpanTransaksi(event) {
  event.preventDefault();
  const data = ambilDataTransaksi();
  const pesan = validasiTransaksi(data);
  tampilkanError('#error-transaksi', pesan);
  if (pesan) return;

  state.transaksi.push({ id: buatId(), ...data });
  kosongkanFormTransaksi();
  simpanData();
  render();
}

function hapusTransaksi(id) {
  state.transaksi = state.transaksi.filter((t) => t.id !== id);
  state.hapusId = null;
  simpanData();
}

function tanganiAksiTransaksi(event) {
  const tombol = event.target.closest('[data-aksi]');
  if (!tombol) return;
  const id = Number(tombol.dataset.id);
  const aksi = tombol.dataset.aksi;
  if (aksi === 'hapus') state.hapusId = id;
  if (aksi === 'batal-hapus') state.hapusId = null;
  if (aksi === 'ya-hapus') hapusTransaksi(id);
  render();
}

function isiPilihanKategori() {
  for (const selector of ['#input-kategori']) {
    for (const kategori of KATEGORI) {
      const pilihan = document.createElement('option');
      pilihan.value = kategori;
      pilihan.textContent = kategori;
      elemen(selector).append(pilihan);
    }
  }
}

function pasangListener() {
  elemen('#form-transaksi').addEventListener('submit', simpanTransaksi);
  elemen('#daftar-transaksi').addEventListener('click', tanganiAksiTransaksi);
}

state.transaksi = muatData(KUNCI_TRANSAKSI);
isiPilihanKategori();
pasangListener();
render();
