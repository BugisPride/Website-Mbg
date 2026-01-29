const ADMIN_USER = "admin";
const ADMIN_PASS = "12345";

let dataMBG = JSON.parse(localStorage.getItem("dataMBG")) || [];
let dusunAktif = "";
let filterAktif = "Semua";

function login(){
  if(username.value===ADMIN_USER && password.value===ADMIN_PASS){
    loginPage.classList.add("hidden");
    dashboard.classList.remove("hidden");
  } else {
    loginError.textContent = "Login gagal!";
  }
}

function logout(){ location.reload(); }

function showForm(edit=false, index=null){
  formSection.classList.remove("hidden");
  if(edit){
    formTitle.textContent="Edit Data";
    editIndex.value=index;
    nama.value=dataMBG[index].nama;
    dusun.value=dataMBG[index].dusun;
    kategori.value=dataMBG[index].kategori;
  } else {
    formTitle.textContent="Tambah Penerima";
    editIndex.value="";
    nama.value="";
  }
}

function batalForm(){ formSection.classList.add("hidden"); }

function simpanData(){
  const item={ nama:nama.value, dusun:dusun.value, kategori:kategori.value };
  if(editIndex.value==="") dataMBG.push(item);
  else dataMBG[editIndex.value]=item;

  localStorage.setItem("dataMBG",JSON.stringify(dataMBG));
  batalForm();
  tampilkanData();
}

function showDusun(n){
  dusunAktif="Dusun "+n;
  judulDusun.textContent="Data Penerima MBG - "+dusunAktif;
  dataSection.classList.remove("hidden");
  tampilkanData();
}

function tampilkanData(){
  tabelData.innerHTML="";
  dataMBG.forEach((d,i)=>{
    if(d.dusun===dusunAktif && (filterAktif==="Semua"||d.kategori===filterAktif)){
      tabelData.innerHTML+=`
      <tr>
        <td><input type="checkbox" class="pilih" data-index="${i}"></td>
        <td>${d.nama}</td>
        <td>${d.kategori}</td>
        <td>
          <button class="edit" onclick="showForm(true,${i})">Edit</button>
          <button class="delete" onclick="hapusData(${i})">Hapus</button>
        </td>
      </tr>`;
    }
  });
}

function hapusData(i){
  if(confirm("Hapus data ini?")){
    dataMBG.splice(i,1);
    localStorage.setItem("dataMBG",JSON.stringify(dataMBG));
    tampilkanData();
  }
}

function filterKategori(k){ filterAktif=k; tampilkanData(); }

function ambilTerpilih(){
  return [...document.querySelectorAll(".pilih:checked")]
    .map(c=>dataMBG[c.dataset.index]);
}

function cetakData(){
  const list=ambilTerpilih();
  let isi=`<h2>Daftar Penerima MBG<br>${dusunAktif}</h2><ol>`;
  list.forEach(d=> isi+=`<li>${d.nama} - ${d.kategori}</li>`);
  isi+="</ol><br>Tanda Tangan Petugas: ____________";
  const w=window.open("");
  w.document.write(isi);
  w.print();
}

async function downloadPDF(){
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const list=ambilTerpilih();

  doc.text("Daftar Penerima MBG - "+dusunAktif,10,10);
  let y=20;
  list.forEach((d,i)=>{
    doc.text(`${i+1}. ${d.nama} - ${d.kategori}`,10,y);
    y+=10;
  });

  doc.save("daftar-mbg-"+dusunAktif+".pdf");
}
