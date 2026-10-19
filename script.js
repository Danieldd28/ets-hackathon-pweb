const KUNCI_TRANSAKSI = 'ets-keuangan:transaksi';
const KUNCI_TAGIHAN = 'ets-keuangan:tagihan';
const KATEGORI = ['Proyek', 'Makan', 'Transport', 'Peralatan', 'Lainnya'];

const state = {
  transaksi: [],
  tagihan: [],
  editId: null,
  hapusId: null,
  filter: { jenis: '', kategori: '', dari: '', sampai: '', cari: '' },
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
  localStorage.setItem(KUNCI_TAGIHAN, JSON.stringify(state.tagihan));
}

function buatId() {
  let terbesar = 0;
  for (const item of [...state.transaksi, ...state.tagihan]) {
    if (item.id > terbesar) terbesar = item.id;
  }
  return terbesar + 1;
}

function cariById(daftar, id) {
  for (const item of daftar) {
    if (item.id === id) return item;
  }
  return null;
}

function hitungRingkasan() {
  let pemasukan = 0;
  let pengeluaran = 0;
  let piutang = 0;
  for (const transaksi of state.transaksi) {
    if (transaksi.jenis === 'pemasukan') pemasukan += transaksi.nominal;
    else pengeluaran += transaksi.nominal;
  }
  for (const tagihan of state.tagihan) {
    if (tagihan.status === 'belum dibayar') piutang += tagihan.nominal;
  }
  return { pemasukan, pengeluaran, saldo: pemasukan - pengeluaran, piutang };
}

function saringTransaksi() {
  const filter = state.filter;
  const kata = filter.cari.toLowerCase();
  return state.transaksi.filter(
    (t) =>
      (!filter.jenis || t.jenis === filter.jenis) &&
      (!filter.kategori || t.kategori === filter.kategori) &&
      (!filter.dari || t.tanggal >= filter.dari) &&
      (!filter.sampai || t.tanggal <= filter.sampai) &&
      t.catatan.toLowerCase().includes(kata)
  );
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

function validasiTagihan(data) {
  if (!data.klien) return 'Nama klien wajib diisi.';
  return validasiTransaksi(data);
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
    return [buatTombol('Edit', 'edit', transaksi.id), buatTombol('Hapus', 'hapus', transaksi.id)];
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

function buatItemTagihan(tagihan) {
  const item = document.createElement('li');

  const info = document.createElement('span');
  info.textContent = `${tagihan.tanggal} · ${tagihan.klien} · ${formatRupiah(tagihan.nominal)}`;

  const status = document.createElement('strong');
  status.className = tagihan.status === 'lunas' ? 'lunas' : 'belum-dibayar';
  status.textContent = tagihan.status;

  item.append(info, status);
  if (tagihan.status === 'belum dibayar') {
    item.append(buatTombol('Tandai lunas', 'lunas', tagihan.id));
  }
  return item;
}

function renderRingkasan() {
  const ringkasan = hitungRingkasan();
  elemen('#total-pemasukan').textContent = formatRupiah(ringkasan.pemasukan);
  elemen('#total-pengeluaran').textContent = formatRupiah(ringkasan.pengeluaran);
  elemen('#saldo').textContent = formatRupiah(ringkasan.saldo);
  elemen('#total-piutang').textContent = formatRupiah(ringkasan.piutang);
}

function renderDaftar() {
  const daftar = saringTransaksi().sort(bandingkanTerbaru);
  const wadah = elemen('#daftar-transaksi');
  if (daftar.length === 0) {
    wadah.replaceChildren(buatPesanKosong('Belum ada transaksi yang cocok.'));
    return;
  }
  wadah.replaceChildren(...daftar.map(buatItemTransaksi));
}

function renderTagihan() {
  const daftar = [...state.tagihan].sort(bandingkanTerbaru);
  const wadah = elemen('#daftar-tagihan');
  if (daftar.length === 0) {
    wadah.replaceChildren(buatPesanKosong('Belum ada tagihan.'));
    return;
  }
  wadah.replaceChildren(...daftar.map(buatItemTagihan));
}

function renderForm() {
  const sedangEdit = state.editId !== null;
  elemen('#judul-form').textContent = sedangEdit ? 'Edit transaksi' : 'Tambah transaksi';
  elemen('#tombol-simpan').textContent = sedangEdit ? 'Simpan perubahan' : 'Simpan';
  elemen('#tombol-batal-edit').hidden = !sedangEdit;
}

function render() {
  renderRingkasan();
  renderDaftar();
  renderTagihan();
  renderForm();
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

function isiFormTransaksi(transaksi) {
  elemen('#input-tanggal').value = transaksi.tanggal;
  elemen('#input-jenis').value = transaksi.jenis;
  elemen('#input-kategori').value = transaksi.kategori;
  elemen('#input-nominal').value = transaksi.nominal;
  elemen('#input-catatan').value = transaksi.catatan;
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

  if (state.editId === null) {
    state.transaksi.push({ id: buatId(), ...data });
  } else {
    const id = state.editId;
    state.transaksi = state.transaksi.map((t) => (t.id === id ? { id, ...data } : t));
  }
  state.editId = null;
  kosongkanFormTransaksi();
  simpanData();
  render();
}

function mulaiEdit(id) {
  const transaksi = cariById(state.transaksi, id);
  if (!transaksi) return;
  state.editId = id;
  isiFormTransaksi(transaksi);
  tampilkanError('#error-transaksi', '');
}

function batalEdit() {
  state.editId = null;
  kosongkanFormTransaksi();
  tampilkanError('#error-transaksi', '');
  render();
}

function hapusTransaksi(id) {
  state.transaksi = state.transaksi.filter((t) => t.id !== id);
  state.hapusId = null;
  if (state.editId === id) batalEdit();
  simpanData();
}

function tanganiAksiTransaksi(event) {
  const tombol = event.target.closest('[data-aksi]');
  if (!tombol) return;
  const id = Number(tombol.dataset.id);
  const aksi = tombol.dataset.aksi;
  if (aksi === 'edit') mulaiEdit(id);
  if (aksi === 'hapus') state.hapusId = id;
  if (aksi === 'batal-hapus') state.hapusId = null;
  if (aksi === 'ya-hapus') hapusTransaksi(id);
  render();
}

function simpanTagihan(event) {
  event.preventDefault();
  const data = {
    tanggal: elemen('#tagihan-tanggal').value,
    klien: elemen('#tagihan-klien').value,
    nominal: Number(elemen('#tagihan-nominal').value),
  };
  const pesan = validasiTagihan(data);
  tampilkanError('#error-tagihan', pesan);
  if (pesan) return;

  state.tagihan.push({ id: buatId(), ...data, status: 'belum dibayar' });
  elemen('#tagihan-tanggal').value = '';
  elemen('#tagihan-klien').value = '';
  elemen('#tagihan-nominal').value = '';
  simpanData();
  render();
}

function tandaiLunas(id) {
  const tagihan = cariById(state.tagihan, id);
  if (!tagihan || tagihan.status === 'lunas') return;
  tagihan.status = 'lunas';
  state.transaksi.push({
    id: buatId(),
    tanggal: tagihan.tanggal,
    jenis: 'pemasukan',
    kategori: 'Proyek',
    nominal: tagihan.nominal,
    catatan: `Tagihan lunas: ${tagihan.klien}`,
  });
  simpanData();
}

function tanganiAksiTagihan(event) {
  const tombol = event.target.closest('[data-aksi="lunas"]');
  if (!tombol) return;
  tandaiLunas(Number(tombol.dataset.id));
  render();
}

function ubahFilter(event) {
  state.filter[event.target.name] = event.target.value;
  render();
}

function isiPilihanKategori() {
  for (const selector of ['#input-kategori', '#filter-kategori']) {
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
  elemen('#tombol-batal-edit').addEventListener('click', batalEdit);
  elemen('#daftar-transaksi').addEventListener('click', tanganiAksiTransaksi);
  elemen('#form-tagihan').addEventListener('submit', simpanTagihan);
  elemen('#daftar-tagihan').addEventListener('click', tanganiAksiTagihan);
  elemen('#filter').addEventListener('input', ubahFilter);
}

state.transaksi = muatData(KUNCI_TRANSAKSI);
state.tagihan = muatData(KUNCI_TAGIHAN);
isiPilihanKategori();
pasangListener();
render();
