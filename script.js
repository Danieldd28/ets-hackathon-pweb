const KATEGORI = ['Proyek', 'Makan', 'Transport', 'Peralatan', 'Lainnya'];

const state = {
  transaksi: [],
};

function elemen(selector) {
  return document.querySelector(selector);
}

function buatId() {
  let terbesar = 0;
  for (const item of state.transaksi) {
    if (item.id > terbesar) terbesar = item.id;
  }
  return terbesar + 1;
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
