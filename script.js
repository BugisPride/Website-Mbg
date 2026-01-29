const ADMIN_USER = "admin";
const ADMIN_PASS = "12345";
let dataMBG = JSON.parse(localStorage.getItem("dataMBG")) || [];

/* LOGIN */
function login() {
  if (username.value === ADMIN_USER && password.value === ADMIN_PASS) {
    loginPage.classList.add("hidden");
    dashboard.classList.remove("hidden");
    cariNama();
  } else loginError.textContent = "Login gagal!";
}
function logout() { location.reload(); }

/* FORM */
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
  localStorage.setItem("dataMBG", JSON.stringify(dataMBG));
  nama.value = "";
  batalForm();
  cariNama();
}

/* CARI */
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
          <button class="status-btn ${d.terima ? 'sudah' : 'belum'}" onclick="toggleTerima(${i})">
            ${d.terima ? 'Sudah' : 'Belum'}
          </button>
        </td>
        <td><button onclick="hapusData(${i})">Hapus</button></td>
      </tr>`;
    }
  });

  updateRekap();
}

/* REKAP */
function updateRekap() {
  rekapTotal.textContent = dataMBG.length;
  rekapSudah.textContent = dataMBG.filter(d => d.terima).length;
  rekapBelum.textContent = dataMBG.filter(d => !d.terima).length;
}

/* STATUS + RIWAYAT */
function toggleTerima(i) {
  const hariIni = new Date().toLocaleDateString("id-ID");
  dataMBG[i].terima = !dataMBG[i].terima;

  if (dataMBG[i].terima && !dataMBG[i].riwayat.includes(hariIni)) {
    dataMBG[i].riwayat.push(hariIni);
  }

  localStorage.setItem("dataMBG", JSON.stringify(dataMBG));
  cariNama();
}

/* HAPUS */
function hapusData(i) {
  if (confirm("Hapus data ini?")) {
    dataMBG.splice(i, 1);
    localStorage.setItem("dataMBG", JSON.stringify(dataMBG));
    cariNama();
  }
}

/* RESET */
function resetSemuaData() {
  if (confirm("Yakin ingin menghapus SEMUA data warga?")) {
    localStorage.removeItem("dataMBG");
    dataMBG = [];
    cariNama();
  }
}

/* FORMAT WAKTU */
function getTanggalWaktu() {
  const now = new Date();
  return now.toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) +
    " — " +
    now.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }) + " WIB";
}

/* CETAK */
function cetakPenerima() {
  let isi = "<h2>Daftar Penerima MBG</h2><br>";
  let grupDusun = {};

  dataMBG.filter(d => d.terima).forEach(d => {
    if (!grupDusun[d.dusun]) grupDusun[d.dusun] = [];
    grupDusun[d.dusun].push(`${d.nama} (${d.kategori})`);
  });

  for (const dusun in grupDusun) {
    let nomor = 1;
    isi += `<b>Dusun ${dusun}</b><br>`;
    grupDusun[dusun].forEach(nama => {
      isi += `${nomor}. ${nama}<br>`;
      nomor++;
    });
    isi += "<br>";
  }

  isi += "Dicetak pada: " + getTanggalWaktu();
  isi += "<br>Tanda Tangan Petugas: ____________";

  const w = window.open("");
  w.document.write("<div style='font-family:Times New Roman'>" + isi + "</div>");
  w.print();
}

/* PDF SEMUA */
async function downloadPDFPenerima() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFont("times", "normal");
  doc.setFontSize(12);

  let y = 20;
  doc.text("DAFTAR PENERIMA MBG", 105, 10, { align: "center" });

  let grupDusun = {};
  dataMBG.filter(d => d.terima).forEach(d => {
    if (!grupDusun[d.dusun]) grupDusun[d.dusun] = [];
    grupDusun[d.dusun].push(`${d.nama} (${d.kategori})`);
  });

  for (const dusun in grupDusun) {
    let nomor = 1;
    doc.setFont("times", "bold");
    doc.text("Dusun " + dusun, 15, y); y += 7;
    doc.setFont("times", "normal");

    grupDusun[dusun].forEach(nama => {
      doc.text(`${nomor}. ${nama}`, 20, y);
      y += 7; nomor++;
      if (y > 270) { doc.addPage(); y = 20; }
    });
    y += 4;
  }

  doc.text("Dicetak pada: " + getTanggalWaktu(), 15, y + 5);
  doc.save("daftar-penerima-mbg.pdf");
}

/* PDF HARI INI */
async function downloadPDFHariIni() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFont("times", "normal");
  doc.setFontSize(12);

  let y = 20;
  const hariIni = new Date().toLocaleDateString("id-ID");
  doc.text("DAFTAR PENERIMA MBG HARI INI", 105, 10, { align: "center" });

  let grupDusun = {};
  dataMBG.filter(d => d.riwayat.includes(hariIni)).forEach(d => {
    if (!grupDusun[d.dusun]) grupDusun[d.dusun] = [];
    grupDusun[d.dusun].push(`${d.nama} (${d.kategori})`);
  });

  for (const dusun in grupDusun) {
    let nomor = 1;
    doc.setFont("times", "bold");
    doc.text("Dusun " + dusun, 15, y); y += 7;
    doc.setFont("times", "normal");

    grupDusun[dusun].forEach(nama => {
      doc.text(`${nomor}. ${nama}`, 20, y);
      y += 7; nomor++;
      if (y > 270) { doc.addPage(); y = 20; }
    });
    y += 4;
  }

  doc.text("Dicetak pada: " + getTanggalWaktu(), 15, y + 5);
  doc.save("penerima-hari-ini.pdf");
}

/* PDF RIWAYAT */
async function downloadPDFRiwayat() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFont("times", "normal");
  doc.setFontSize(12);

  let y = 20;
  doc.text("RIWAYAT PENERIMAAN MBG", 105, 10, { align: "center" });

  dataMBG.forEach(d => {
    if (d.riwayat.length > 0) {
      doc.text(`${d.nama} (${d.kategori}) - ${d.dusun}`, 15, y); y += 6;
      doc.text("Tanggal menerima: " + d.riwayat.join(", "), 20, y); y += 10;
      if (y > 270) { doc.addPage(); y = 20; }
    }
  });

  doc.save("riwayat-penerimaan-mbg.pdf");
}

/* IMPORT EXCEL */
function importExcel(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const workbook = XLSX.read(new Uint8Array(e.target.result), { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(sheet);

    jsonData.forEach(row => {
      if (row.Nama && row.Dusun && row.Kategori) {
        dataMBG.push({ nama: row.Nama, dusun: row.Dusun, kategori: row.Kategori, terima: false, riwayat: [] });
      }
    });

    localStorage.setItem("dataMBG", JSON.stringify(dataMBG));
    alert("Import berhasil!");
    cariNama();
  };
  reader.readAsArrayBuffer(file);
}
