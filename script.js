const KATEGORI = ['Proyek', 'Makan', 'Transport', 'Peralatan', 'Lainnya'];

const state = {
  transaksi: [],
};

function elemen(selector) {
  return document.querySelector(selector);
}

function formatRupiah(angka) {
  return 'Rp ' + angka.toLocaleString('id-ID');
}

function buatId() {
  let terbesar = 0;
  for (const item of state.transaksi) {
    if (item.id > terbesar) terbesar = item.id;
  }
  return terbesar + 1;
}

function bandingkanTerbaru(a, b) {
  if (a.tanggal === b.tanggal) return b.id - a.id;
  return a.tanggal < b.tanggal ? 1 : -1;
}

function buatPesanKosong(teks) {
  const kosong = document.createElement('li');
  kosong.textContent = teks;
  return kosong;
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

  item.append(info, nominal);
  return item;
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

  state.transaksi.push({ id: buatId(), ...data });
  kosongkanFormTransaksi();
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
}

isiPilihanKategori();
pasangListener();
render();
