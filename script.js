/* ================= KONFIGURASI ================= */
const ADMIN_USER = "admin";
const ADMIN_PASS = "12345";

let dataMBG = JSON.parse(localStorage.getItem("dataMBG")) || [];
let modeExport = "";

/* ================= UTIL ================= */
function simpanLocal() {
  localStorage.setItem("dataMBG", JSON.stringify(dataMBG));
}

function getTanggalWaktu() {
  const now = new Date();
  return now.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }) + " — " +
  now.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit"
  }) + " WIB";
}

/* ================= LOGIN ================= */
function login() {
  if (username.value === ADMIN_USER && password.value === ADMIN_PASS) {
    loginPage.classList.add("hidden");
    dashboard.classList.remove("hidden");
    cariNama();
  } else {
    loginError.textContent = "Login gagal!";
  }
}

function logout() {
  popupPilihan.classList.add("hidden");
  location.reload();
}

/* ================= FORM DATA ================= */
function showForm() { formSection.classList.remove("hidden"); }
function batalForm() { formSection.classList.add("hidden"); }

function simpanData() {
  if (!nama.value) return alert("Nama belum diisi");

  dataMBG.push({
    nama: nama.value,
    dusun: dusun.value,
    kategori: kategori.value,
    terima: false,
    riwayat: []
  });

  simpanLocal();
  nama.value = "";
  batalForm();
  cariNama();
}

/* ================= TABEL & REKAP ================= */
function cariNama() {
  const keyword = searchNama.value.toLowerCase();
  tabelData.innerHTML = "";

  dataMBG.forEach((d, i) => {
    if (d.nama.toLowerCase().includes(keyword)) {
      tabelData.innerHTML += `
        <tr>
          <td>${d.nama}</td>
          <td>${d.dusun}</td>
          <td>${d.kategori}</td>
          <td>
            <button class="${d.terima ? 'status-sudah' : 'status-belum'}"
              onclick="toggleTerima(${i})">
              ${d.terima ? 'Sudah' : 'Belum'}
            </button>
          </td>
          <td>
            <button class="btn-hapus" onclick="hapusData(${i})">Hapus</button>
          </td>
        </tr>`;
    }
  });

  updateRekap();
}

function updateRekap() {
  rekapSudah.textContent = dataMBG.filter(d => d.terima).length;
  rekapBelum.textContent = dataMBG.filter(d => !d.terima).length;
  rekapTotal.textContent = dataMBG.length;
}

/* ================= STATUS TERIMA ================= */
function toggleTerima(i) {
  const hariIni = new Date().toLocaleDateString("id-ID");
  dataMBG[i].terima = !dataMBG[i].terima;

  if (dataMBG[i].terima && !dataMBG[i].riwayat.includes(hariIni)) {
    dataMBG[i].riwayat.push(hariIni);
  }

  simpanLocal();
  cariNama();
}

/* ================= HAPUS DATA ================= */
function hapusData(i) {
  if (confirm("Hapus data ini?")) {
    dataMBG.splice(i, 1);
    simpanLocal();
    cariNama();
  }
}

function resetSemuaData() {
  if (confirm("Hapus SEMUA data warga?")) {
    localStorage.removeItem("dataMBG");
    dataMBG = [];
    cariNama();
  }
}

/* ================= POPUP EXPORT ================= */
function bukaPopup(mode) {
  if (dashboard.classList.contains("hidden")) return;
  modeExport = mode;
  popupPilihan.classList.remove("hidden");
}

function tutupPopup() {
  popupPilihan.classList.add("hidden");
}

function prosesPilihan(p) {
  tutupPopup();

  if (modeExport === "pdf") {
    if (p === 1) pdfFilter(d => d.terima, "SUDAH MENERIMA", "sudah-menerima.pdf");
    if (p === 2) pdfFilter(d => !d.terima, "BELUM MENERIMA", "belum-menerima.pdf");
    if (p === 3) pdfFilter(() => true, "SEMUA WARGA", "semua-warga.pdf");
  }

  if (modeExport === "cetak") {
    window.print();
  }
}

/* ================= PDF RAPI ================= */
function pdfFilter(filterFn, judul, fileName) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFont("times", "bold");
  doc.setFontSize(14);
  doc.text("DAFTAR PENERIMAAN MBG DESA", 105, 15, { align: "center" });

  doc.setFontSize(11);
  doc.setFont("times", "normal");
  doc.text("Tanggal Cetak: " + getTanggalWaktu(), 105, 22, { align: "center" });

  let y = 30;

  if (judul === "SEMUA WARGA") {
    y = buatBagianStatus(doc, "A. SUDAH MENERIMA MBG", d => d.terima, y);
    y += 8;
    buatBagianStatus(doc, "B. BELUM MENERIMA MBG", d => !d.terima, y);
  } else {
    buatPerDusunTabel(doc, dataMBG.filter(filterFn), y);
  }

  doc.save(fileName);
}

/* ================= BAGIAN STATUS ================= */
function buatBagianStatus(doc, judulBagian, filterStatus, y) {
  doc.setFont("times", "bold");
  doc.setFontSize(12);
  doc.text(judulBagian, 15, y);
  y += 6;

  doc.setFont("times", "normal");
  const dataFilter = dataMBG.filter(filterStatus);

  return buatPerDusunTabel(doc, dataFilter, y);
}

/* ================= TABEL PER DUSUN ================= */
function buatPerDusunTabel(doc, dataArray, y) {
  const kelompokDusun = {};

  dataArray.forEach(d => {
    if (!kelompokDusun[d.dusun]) kelompokDusun[d.dusun] = [];
    kelompokDusun[d.dusun].push(d);
  });

  for (let dusun in kelompokDusun) {
    doc.setFont("times", "bold");
    doc.text("Dusun " + dusun, 15, y);
    y += 5;

    doc.setFont("times", "bold");
    doc.text("No", 15, y);
    doc.text("Nama Warga", 25, y);
    doc.text("Kategori", 120, y);
    y += 2;
    doc.line(15, y, 195, y);
    y += 4;

    doc.setFont("times", "normal");
    let no = 1;

    kelompokDusun[dusun].forEach(warga => {
      doc.text(String(no++), 15, y);
      doc.text(warga.nama, 25, y);
      doc.text(warga.kategori, 120, y);
      y += 6;

      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    y += 6;
  }

  return y;
}
