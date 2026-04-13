// URGENT
window.onerror = function(msg, url, linenumber) {
    alert('Error: ' + msg + '\nLini: ' + linenumber);
    return true;
};

// =====================
// STORAGE
// =====================
let categories = JSON.parse(localStorage.getItem("categories")) || [];
let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

// =====================
// INIT
// =====================
if (categories.length === 0) {
  categories = [
    { id: Date.now(), name: "Tunai", balance: 0 }
  ];
  saveData();
}

// =====================
// SAVE
// =====================
function saveData() {
  localStorage.setItem("categories", JSON.stringify(categories));
  localStorage.setItem("transactions", JSON.stringify(transactions));
}

// =====================
// FORMAT RUPIAH
// =====================
function rupiah(num) {
  return "Rp " + num.toLocaleString("id-ID");
}

// =====================
// RENDER DASHBOARD
// =====================
function renderDashboard() {
  const el = document.getElementById("kategoriList");
  el.innerHTML = "";

  let total = 0;

  categories.forEach(cat => {
    total += cat.balance;

    el.innerHTML += `
      <div class="bg-white p-4 rounded-xl shadow flex justify-between items-center">
        <div>
          <p class="font-bold">${cat.name}</p>
          <p class="text-sm text-gray-500">${rupiah(cat.balance)}</p>
        </div>
      </div>
    `;
  });

  document.getElementById("totalSaldo").innerText = rupiah(total);
}

// =====================
// RENDER TRANSAKSI
// =====================
function renderTransaksi() {
  const el = document.getElementById("transaksiList");
  if (!el) return; // Pengaman jika elemen tidak ditemukan

  const searchInput = document.getElementById("searchTrx");
  const filterSelect = document.getElementById("filterBulan");
  
  const searchQuery = searchInput ? searchInput.value.toLowerCase() : "";
  const filterVal = filterSelect ? filterSelect.value : "all";
  
  el.innerHTML = "";

  // 1. Filter Data
  const filtered = transactions.filter(trx => {
    // Parsing tanggal dengan aman
    const dateObj = new Date(trx.date);
    
    // Jika tanggal tidak valid, lewati transaksi ini agar tidak merusak aplikasi
    if (isNaN(dateObj.getTime())) return false;

    // Ambil format bulan-tahun yang sama persis dengan fungsi updateFilterOptions
    const m = dateObj.getMonth() + 1;
    const y = dateObj.getFullYear();
    const mY = `${m}-${y}`;
    
    // Pencarian: pastikan note dan categoryName ada isinya sebelum di-toLowerCase
    const note = (trx.note || "").toLowerCase();
    const category = (trx.categoryName || "").toLowerCase();
    
    const matchSearch = note.includes(searchQuery) || category.includes(searchQuery);
    const matchMonth = filterVal === "all" || mY === filterVal;

    return matchSearch && matchMonth;
  });

  // 2. Tampilan jika hasil filter kosong
  if (filtered.length === 0) {
    el.innerHTML = `
      <div class="flex flex-col items-center justify-center py-10 text-gray-400">
        <p class="text-sm">Tidak ada transaksi ditemukan</p>
      </div>
    `;
    return;
  }

  // 3. Render Data (Terbaru di atas)
  // Gunakan slice() sebelum reverse() agar tidak merubah urutan array asli
  filtered.slice().reverse().forEach(trx => {
    const isMasuk = trx.type === "masuk";
    const colorClass = isMasuk ? "text-green-600" : "text-red-600";
    const symbol = isMasuk ? "+" : "-";

    el.innerHTML += `
      <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
        <div class="flex-1">
          <p class="font-bold text-slate-800">${trx.categoryName}</p>
          <p class="text-xs text-slate-500 italic">${trx.note || "Tanpa catatan"}</p>
        </div>
        <div class="text-right">
          <p class="${colorClass} font-bold text-sm">
            ${symbol} ${rupiah(trx.amount)}
          </p>
          <p class="text-[10px] text-slate-400 mt-1">
            ${formatTanggalIndo(trx.date)}
          </p>
        </div>
      </div>
    `;
  });
}

// Fungsi pembantu agar tampilan tanggal di kartu transaksi lebih cantik
function formatTanggalIndo(dateString) {
  const options = { day: 'numeric', month: 'short', year: 'numeric' };
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return dateString;
  return new Intl.DateTimeFormat('id-ID', options).format(d);
}

// =====================
// RENDER KATEGORI MANAGE
// =====================
function renderKategoriManage() {
  const el = document.getElementById("kategoriManageList");
  el.innerHTML = "";

  categories.forEach(cat => {
    el.innerHTML += `
      <div class="bg-white p-3 rounded-lg shadow flex justify-between items-center">
        <p>${cat.name}</p>
        <button onclick="hapusKategori(${cat.id})" class="text-red-500">
          Hapus
        </button>
      </div>
    `;
  });
}

function updateFilterOptions() {
  const select = document.getElementById("filterBulan");
  if (!select) return;
  const currentVal = select.value;
  
  // 1. Filter hanya transaksi yang punya tanggal valid
  const validDates = transactions
    .filter(trx => trx.date && !isNaN(new Date(trx.date).getTime()))
    .map(trx => {
      const d = new Date(trx.date);
      return `${d.getMonth() + 1}-${d.getFullYear()}`;
    });

  const dates = [...new Set(validDates)];

  select.innerHTML = '<option value="all">Semua Waktu</option>';
  
  dates.sort((a, b) => {
    // Sortir manual supaya urutan tahun & bulan benar
    const [m1, y1] = a.split("-").map(Number);
    const [m2, y2] = b.split("-").map(Number);
    return y2 - y1 || m2 - m1;
  }).forEach(dateStr => {
    const [m, y] = dateStr.split("-").map(Number); // Pastikan jadi angka
    
    // 2. Gunakan pengecekan angka untuk menghindari Invalid Date
    const dateObj = new Date(y, m - 1);
    if (!isNaN(dateObj.getTime())) {
      const monthName = new Intl.DateTimeFormat('id-ID', { month: 'long' }).format(dateObj);
      select.innerHTML += `<option value="${dateStr}">${monthName} ${y}</option>`;
    }
  });

  select.value = currentVal;
}

// =====================
// DROPDOWN MODAL
// =====================
function renderDropdownKategori() {
  const el = document.getElementById("inputKategoriTransaksi");
  el.innerHTML = "";

  categories.forEach(cat => {
    el.innerHTML += `<option value="${cat.id}">${cat.name}</option>`;
  });
}

// =====================
// TAMBAH KATEGORI
// =====================
function customAlert(pesan) {
  document.getElementById("alertMessage").innerText = pesan;
  document.getElementById("modalAlert").classList.remove("hidden");
}

function closeCustomAlert() {
  document.getElementById("modalAlert").classList.add("hidden");
}

function tambahKategori() {
  const input = document.getElementById("inputKategori");
  const name = input.value.trim();

  if (!name) return customAlert("Isi nama kategori terlebih dahulu!");

  categories.push({
    id: Date.now(),
    name,
    balance: 0
  });

  input.value = "";
  saveData();
  renderAll();
}

// =====================
// HAPUS KATEGORI
// =====================
// =====================
// LOGIK KONFIRMASI HAPUS
// =====================
let idKategoriYangAkanDihapus = null;
let jawabanBenar = 0;

// Fungsi yang dipanggil saat tombol "Hapus" di list ditekan
function hapusKategori(id) {
  idKategoriYangAkanDihapus = id;
  
  // Buat angka random 1-10
  const angka1 = Math.floor(Math.random() * 10) + 1;
  const angka2 = Math.floor(Math.random() * 10) + 1;
  
  jawabanBenar = angka1 + angka2;
  
  // Tampilkan soal di modal
  document.getElementById("labelSoal").innerText = `${angka1} + ${angka2} = ?`;
  document.getElementById("inputJawaban").value = ""; // Reset input
  
  // Buka modal
  document.getElementById("modalKonfirmasi").classList.remove("hidden");
}

function closeModalKonfirmasi() {
  document.getElementById("modalKonfirmasi").classList.add("hidden");
  idKategoriYangAkanDihapus = null;
}

function eksekusiHapus() {
  const jawabanUser = parseInt(document.getElementById("inputJawaban").value);

  if (jawabanUser === jawabanBenar) {
    // Jalankan proses hapus jika jawaban benar
    categories = categories.filter(c => c.id !== idKategoriYangAkanDihapus);
    saveData();
    renderAll();
    closeModalKonfirmasi();
  } else {
    customAlert("Jawaban salah! Gagal menghapus kategori.");
    closeModalKonfirmasi();
  }
}

// =====================
// MODAL
// =====================
function openModal() {
  renderDropdownKategori();
  document.getElementById("modal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("modal").classList.add("hidden");
}

// =====================
// QUICK NOTES FEATURE
// =====================

const tags = {
  masuk: ["Gaji", "Uang Jajan", "Bonus", "Lainnya"],
  keluar: ["Makanan", "Pulsa", "Jajan", "Kesehatan", "Lainnya"]
};

// Fungsi untuk menampilkan tombol berdasarkan tipe
function renderQuickNotes() {
  const type = document.getElementById("inputType").value;
  const container = document.getElementById("quickNotes");
  container.innerHTML = "";

  tags[type].forEach(tag => {
    const btn = document.createElement("button");
    btn.innerText = tag;
    // Ganti baris btn.className yang lama dengan ini:
    btn.className = "text-xs px-3 py-1 rounded-full border transition-all dynamic-light-bg-hover";

    // Tambahkan class khusus di bawahnya agar teksnya tetap jelas
    btn.classList.add(isDarkMode ? "text-slate-200" : "text-slate-700");
    btn.style.borderColor = isDarkMode ? "#475569" : "#cbd5e1";
    
    // Saat diklik, isi ke input catatan
    btn.onclick = () => {
      document.getElementById("inputNote").value = tag;
    };
    
    container.appendChild(btn);
  });
}

// Tambahkan listener agar saat dropdown tipe berubah, tombol ikut berubah
document.getElementById("inputType").addEventListener("change", renderQuickNotes);

// Update juga fungsi openModal yang lama agar merender quick notes saat dibuka
const originalOpenModal = openModal;
openModal = function() {
  originalOpenModal();
  renderQuickNotes(); // Render tombol pertama kali saat modal dibuka
};

// =====================
// TAMBAH TRANSAKSI
// =====================

function submitTransaksi() {
  const categoryId = parseInt(document.getElementById("inputKategoriTransaksi").value);
  const type = document.getElementById("inputType").value;
  const rawAmount = document.getElementById("inputAmount").value.replace(/\./g, "");
  const amount = parseInt(rawAmount);
  const note = document.getElementById("inputNote").value.trim() || "Lainnya";

  if (!amount) return customAlert("Isi nominal terlebih dahulu");

  const category = categories.find(c => c.id === categoryId);

  if (type === "masuk") {
    category.balance += amount;
  } else {
    category.balance -= amount;
  }

  transactions.push({
    id: Date.now(),
    type,
    amount,
    categoryId,
    categoryName: category.name,
    note,
    date: new Date().toISOString() // Pakai toISOString(), bukan toLocaleString()
  });

  document.getElementById("inputAmount").value = "";
  document.getElementById("inputNote").value = "";

  saveData();
  closeModal();
  renderAll();
}

// =====================
// THEME ENGINE
// =====================
let currentTheme = localStorage.getItem("theme") || "blue";
let isDarkMode = localStorage.getItem("darkMode") === "true";

function applyTheme() {
  // Apply Color
  document.body.setAttribute("data-theme", currentTheme);
  
  // Apply Dark Mode
  if (isDarkMode) {
    document.body.classList.add("dark-mode");
    document.getElementById("darkToggle").checked = true;
  } else {
    document.body.classList.remove("dark-mode");
    document.getElementById("darkToggle").checked = false;
  }
}

function changeTheme(color) {
  currentTheme = color;
  localStorage.setItem("theme", color);
  applyTheme();
}

function toggleDarkMode() {
  isDarkMode = document.getElementById("darkToggle").checked;
  localStorage.setItem("darkMode", isDarkMode);
  applyTheme();
}

// Tambahkan "pengaturan" ke dalam showPage
// (Pastikan fungsi showPage yang sebelumnya sudah mencakup page-pengaturan)

// Panggil applyTheme saat pertama kali load
applyTheme();

// =====================
// AUTO FORMAT RUPIAH INPUT
// =====================
const inputAmount = document.getElementById("inputAmount");

inputAmount.addEventListener("keyup", function(e) {
  // Ambil angka saja
  let cursorPostion = this.selectionStart;
  let value = this.value.replace(/[^0-9]/g, "");
  
  // Format jadi titik ribuan
  this.value = formatRibuan(value);
});

function formatRibuan(angka) {
  if (!angka) return "";
  return angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// =====================
// STATISTIK
// =====================
let myChart = null;
let currentChartType = 'keluar'; // Default tampilan

function updateChart(type) {
  currentChartType = type;
  
  // Update UI Tab
  const tabKeluar = document.getElementById("tab-keluar");
  const tabMasuk = document.getElementById("tab-masuk");
  
  if (type === 'keluar') {
    tabKeluar.className = "flex-1 py-2 rounded-lg text-sm font-bold bg-white shadow text-slate-800";
    tabMasuk.className = "flex-1 py-2 rounded-lg text-sm font-bold text-slate-500";
  } else {
    tabMasuk.className = "flex-1 py-2 rounded-lg text-sm font-bold bg-white shadow text-slate-800";
    tabKeluar.className = "flex-1 py-2 rounded-lg text-sm font-bold text-slate-500";
  }

  // Ambil Data Transaksi berdasarkan tipe
  const filteredTrx = transactions.filter(t => t.type === type);

  if (filteredTrx.length === 0) {
    if (myChart) myChart.destroy();
    document.getElementById("chartLegend").innerHTML = `<p class="text-center text-slate-400 mt-10">Belum ada data ${type}</p>`;
    // Opsional: bersihkan canvas
    const ctx = document.getElementById('myChart').getContext('2d');
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    return;
  }
  
  // Kelompokkan total per kategori
  const dataMap = {};
  filteredTrx.forEach(t => {
    dataMap[t.categoryName] = (dataMap[t.categoryName] || 0) + t.amount;
  });

  const labels = Object.keys(dataMap);
  const dataValues = Object.values(dataMap);

  // Hancurkan chart lama jika ada sebelum buat baru
  if (myChart) myChart.destroy();

  const ctx = document.getElementById('myChart').getContext('2d');
  
  // Warna-warna estetik
  const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

  myChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: dataValues,
        backgroundColor: colors,
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false } // Kita buat legend custom di bawah
      }
    }
  });

  renderChartLegend(dataMap, colors);
}

function renderChartLegend(dataMap, colors) {
  const container = document.getElementById("chartLegend");
  container.innerHTML = "";
  
  const total = Object.values(dataMap).reduce((a, b) => a + b, 0);

  Object.entries(dataMap).forEach(([name, val], i) => {
    const percent = ((val / total) * 100).toFixed(1);
    container.innerHTML += `
      <div class="bg-white dark-content p-3 rounded-xl flex justify-between items-center shadow-sm">
        <div class="flex items-center gap-3">
          <div class="w-3 h-3 rounded-full" style="background-color: ${colors[i % colors.length]}"></div>
          <span class="font-medium">${name}</span>
        </div>
        <div class="text-right">
          <p class="font-bold">${rupiah(val)}</p>
          <p class="text-[10px] text-slate-400">${percent}%</p>
        </div>
      </div>
    `;
  });
}

// Tambahkan inisialisasi di dalam fungsi showPage
// Modifikasi showPage agar memicu updateChart saat halaman statistik dibuka
function showPage(page) {
  // ... (kode showPage yang lama) ...
  
  if (page === 'statistik') {
    updateChart(currentChartType);
  }
}

// =====================
// PIN SECURITY SYSTEM
// =====================
let currentPin = localStorage.getItem("app_pin") || null;
let pinInputBuffer = "";

// 1. Inisialisasi: Cek apakah butuh kunci saat buka app
function checkPinLock() {
  if (currentPin) {
    document.getElementById("pinScreen").classList.remove("hidden");
    updatePinDots();
  }
}

// 2. Input PIN via Numpad
function inputPin(num) {
  if (pinInputBuffer.length < 6) {
    pinInputBuffer += num;
    updatePinDots();
  }
  
  if (pinInputBuffer.length === 6) {
    setTimeout(verifyPin, 200);
  }
}

function updatePinDots() {
  const dots = document.querySelectorAll(".pin-dot");
  dots.forEach((dot, index) => {
    if (index < pinInputBuffer.length) {
      dot.classList.add("active");
    } else {
      dot.classList.remove("active");
    }
  });
}

function verifyPin() {
  if (pinInputBuffer === currentPin) {
    document.getElementById("pinScreen").classList.add("hidden");
    pinInputBuffer = "";
  } else {
    // Salah PIN
    const screen = document.querySelector("#pinScreen > div");
    screen.classList.add("shake");
    setTimeout(() => { screen.classList.remove("shake"); }, 300);
    clearPin();
  }
}

function deletePin() {
  pinInputBuffer = pinInputBuffer.slice(0, -1);
  updatePinDots();
}

function clearPin() {
  pinInputBuffer = "";
  updatePinDots();
}

// 3. Setel PIN Baru di Pengaturan
function openModalPin() {
  document.getElementById("modalSetPin").classList.remove("hidden");
}

function closeModalPin() {
  document.getElementById("modalSetPin").classList.add("hidden");
  document.getElementById("newPinInput").value = "";
}

function saveNewPin() {
  const pin1 = document.getElementById("newPinInput").value;
  const pin2 = document.getElementById("confirmPinInput").value;

  // 1. Cek apakah panjangnya sudah 6 digit
  if (pin1.length !== 6 || pin2.length !== 6) {
    return customAlert("PIN harus 6 digit angka!");
  }

  // 2. Cek apakah mengandung karakter selain angka (opsional tapi bagus)
  if (isNaN(pin1) || isNaN(pin2)) {
    return customAlert("PIN hanya boleh berisi angka!");
  }

  // 3. Cek apakah PIN pertama dan kedua sama
  if (pin1 !== pin2) {
    // Kosongkan input konfirmasi saja agar user bisa coba lagi
    document.getElementById("confirmPinInput").value = "";
    return customAlert("PIN Konfirmasi tidak cocok!");
  }

  // 4. Jika semua oke, simpan
  localStorage.setItem("app_pin", pin1);
  currentPin = pin1;
  
  updatePinStatus();
  closeModalPin();
  customAlert("PIN Berhasil diaktifkan! Aplikasi akan terkunci otomatis.");
}

// Jangan lupa update fungsi closeModalPin agar reset kedua input
function closeModalPin() {
  document.getElementById("modalSetPin").classList.add("hidden");
  document.getElementById("newPinInput").value = "";
  document.getElementById("confirmPinInput").value = "";
}

function updatePinStatus() {
  const statusText = document.getElementById("pinStatusText");
  const btnHapus = document.getElementById("btnHapusPin");
  
  if (currentPin) {
    statusText.innerText = "Aktif (Aplikasi Terkunci)";
    statusText.classList.remove("text-slate-500");
    statusText.classList.add("text-green-500");
    btnHapus.classList.remove("hidden"); // Munculkan tombol hapus
  } else {
    statusText.innerText = "Belum aktif";
    statusText.classList.remove("text-green-500");
    statusText.classList.add("text-slate-500");
    btnHapus.classList.add("hidden"); // Sembunyikan tombol hapus
  }
}

// Variabel khusus untuk keamanan
let pinActionCallback = null;

function showModalKonfirmasiPin(judul, pesan, callback) {
  const modal = document.getElementById("modalKonfirmasiPin");
  document.getElementById("judulPinKonf").innerText = judul;
  document.getElementById("pesanPinKonf").innerText = pesan;
  
  modal.classList.remove("hidden");
  pinActionCallback = callback;
}

function aksiKonfirmasiYaPin() {
  if (pinActionCallback) {
    pinActionCallback();
  }
  closeModalKonfirmasiPin();
}

function closeModalKonfirmasiPin() {
  document.getElementById("modalKonfirmasiPin").classList.add("hidden");
  pinActionCallback = null;
}

// Update fungsi pemicu hapus pin yang sebelumnya
function requestHapusPin() {
  showModalKonfirmasiPin(
    "Matikan PIN?", 
    "Anda harus mengatur ulang PIN jika ingin mengaktifkannya kembali.", 
    function() {
      executeHapusPin();
    }
  );
}

function executeHapusPin() {
  localStorage.removeItem("app_pin");
  currentPin = null;
  updatePinStatus(); // Pastikan tombol hapus hilang & status berubah
  customAlert("Keamanan PIN dinonaktifkan");
}

// Panggil fungsi ini di paling bawah app.js
checkPinLock();
updatePinStatus();

// ================
// RESET SEMUA DATA
// ================
const daftarBuah = ["MANGGA", "PISANG", "JERUK", "APEL", "ANGGUR", "MELON", "SEMANGKA", "DURIAN"];
let buahTargetSekarang = "";

function openModalReset() {
  const modal = document.getElementById("modalResetData");
  const displayTarget = document.getElementById("targetBuah");
  const inputField = document.getElementById("inputKonfirmasiBuah");
  
  // Pilih buah acak
  buahTargetSekarang = daftarBuah[Math.floor(Math.random() * daftarBuah.length)];
  displayTarget.innerText = buahTargetSekarang;
  
  // Reset input
  inputField.value = "";
  modal.classList.remove("hidden");
}

function closeModalReset() {
  document.getElementById("modalResetData").classList.add("hidden");
}

function verifikasiReset() {
  const inputUser = document.getElementById("inputKonfirmasiBuah").value.trim().toUpperCase();
  
  if (inputUser === buahTargetSekarang) {
    executeFullReset();
  } else {
    // Jika salah, kita beri feedback visual tanpa menutup modal dulu agar user bisa coba lagi
    // Tapi karena alert kamu tertutup, kita pakai cara ini:
    customAlert("Kata salah! Coba lagi.");
    
    // Acak ulang buahnya
    buahTargetSekarang = daftarBuah[Math.floor(Math.random() * daftarBuah.length)];
    document.getElementById("targetBuah").innerText = buahTargetSekarang;
    document.getElementById("inputKonfirmasiBuah").value = "";
  }
}

function executeFullReset() {
  // 1. Bersihkan Storage sama sekali
  localStorage.removeItem("transactions");
  localStorage.removeItem("categories");

  // 2. Isi ulang variabel (opsional karena akan di-refresh, tapi baik untuk jaga-jaga)
  transactions = [];
  categories = [];

  // 3. Simpan kondisi kosong
  saveData(); 

  // 4. Tutup modal reset
  closeModalReset();

  // 5. Tampilkan notifikasi, lalu REFRESH setelahnya
  // Kita beri jeda agar user sempat membaca alert suksesnya
  customAlert("Semua data berhasil dihapus! Aplikasi akan memuat ulang...");

  localStorage.removeItem("app_pin");
  currentPin = null;
  updatePinStatus();

  setTimeout(() => {
    // Fungsi bawaan browser untuk refresh halaman
    location.reload();
  }, 3500); // 1.5 detik jeda agar tidak terlalu mendadak
}

// =====================
// NAVIGATION
// =====================
function showPage(page) {
  // 1. Daftar semua ID halaman yang tersedia
  const pages = ["dashboard", "statistik", "transaksi", "kategori", "pengaturan"];
  
  // 2. Sembunyikan semua halaman terlebih dahulu
  pages.forEach(p => {
    const el = document.getElementById("page-" + p);
    if (el) el.classList.add("hidden");
  });

  // 3. Tampilkan halaman yang dipilih
  const targetPage = document.getElementById("page-" + page);
  if (targetPage) {
    targetPage.classList.remove("hidden");
  }

  // 4. Update Navigasi (Tombol Bottom Nav)
  const navButtons = document.querySelectorAll(".nav-btn");
  navButtons.forEach(btn => {
    // Reset semua tombol ke warna abu-abu default
    btn.classList.remove("nav-active");
    btn.classList.add("text-slate-400");
  });

  // 5. Aktifkan style tombol yang dipilih
  const activeBtn = document.getElementById("nav-" + page);
  if (activeBtn) {
    activeBtn.classList.remove("text-slate-400");
    activeBtn.classList.add("nav-active");
  }

  // 6. KHUSUS UNTUK HALAMAN STATISTIK
  // Kita panggil updateChart SETELAH 'hidden' dilepas agar Chart.js bisa menghitung ukuran canvas
  if (page === 'statistik') {
    // Gunakan timeout kecil (50ms) untuk memastikan browser sudah selesai merender halaman
    setTimeout(() => {
      if (typeof updateChart === "function") {
        updateChart(currentChartType);
      }
    }, 50);
  }
}

// Tambahkan pemanggilan showPage di akhir file agar saat refresh, nav 'dashboard' langsung aktif
showPage('dashboard');

// =====================
// RENDER ALL
// =====================
function renderAll() {
  renderDashboard();
  renderTransaksi();
  updateFilterOptions();
  renderKategoriManage();
}

// =====================
// INIT
// =====================
renderAll();