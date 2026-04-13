# 💰 Finance Tracker PWA

A simple and powerful **Progressive Web App (PWA)** for tracking personal income and expenses.  
Built with **vanilla JavaScript + Tailwind CSS + Chart.js**, fully offline-ready with Service Worker.

---

## 🚀 Demo
> Deploy via Netlify / static hosting  
https://uang-gue.netlify.app

---

## ✨ Features

### 📊 Finance Management
- Tambah pemasukan & pengeluaran
- Kategori transaksi custom
- Riwayat transaksi lengkap
- Pencarian & filter berdasarkan bulan

### 📈 Analytics
- Chart pemasukan vs pengeluaran
- Visualisasi kategori keuangan
- Statistik real-time (Chart.js)

### 🔐 Security
- PIN 6 digit lock screen
- Proteksi aplikasi saat dibuka
- Reset keamanan

### 🎨 UI & UX
- Dark mode support 🌙
- Multi theme color (blue, green, purple, red)
- Responsive mobile-first design
- Bottom navigation style app-like UI

### ⚡ PWA Features
- Installable on Android & Desktop
- Offline support (Service Worker)
- Fast loading with caching
- Native app-like experience

---

## 🧠 Tech Stack

- HTML5
- Vanilla JavaScript
- Tailwind CSS
- Chart.js
- Font Awesome
- Service Worker (PWA)
- LocalStorage (data persistence)

---

## 📂 Project Structure

```

/finance-tracker
│
├── index.html
├── app.js
├── sw.js
├── manifest.json
├── icon-192.png
├── icon-512.png 
└── README.md

````

---

## ⚙️ How It Works

### 1. Data Storage
- Semua data disimpan di **localStorage**
- Tidak butuh backend/server

### 2. Offline Mode
- Service Worker menyimpan file penting ke cache
- Aplikasi tetap bisa dibuka tanpa internet

### 3. Charts
- Chart.js digunakan untuk visualisasi transaksi

---

## 🔧 Installation

### 1. Clone repo
```bash
git clone https://github.com/aja995997-cpu/Finance-Tracker---My-First-PWA.git
````

### 2. Open project

Buka `index.html` di browser

### 3. Deploy (recommended)

* Netlify
* Vercel
* GitHub Pages

---

## 📱 Install as PWA

### Android (Chrome)

1. Buka website
2. Klik menu "Install App"
3. Aplikasi akan muncul di home screen

### Desktop

1. Buka Chrome
2. Klik icon install di address bar

---

## 🔒 Security Notes

* PIN disimpan di localStorage (client-side only)
* Tidak menggunakan server authentication
* Cocok untuk personal use

---

## ⚡ Service Worker

Aplikasi ini menggunakan Service Worker untuk:

* Cache file utama
* Speed optimization
* Offline support

```js
self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(res => res || fetch(event.request))
  );
});
```

---

## 📌 Future Improvements

* [ ] Cloud sync (Firebase / Supabase)
* [ ] Export data to Excel / CSV
* [ ] Multi-user support
* [ ] Budgeting system
* [ ] Push notification reminder (harian jam 18:00)
* [ ] Encrypted local storage

---

## 💡 Ideal Use Case

* Personal finance tracking
* Daily expense monitoring
* Budget control
* Offline-first financial app

---

## 👨‍💻 Author

Built by: **Aja/Fatih/Asoy**
PWA Project for learning & productivity

---

## 📜 License

MIT License — free to use and modify

```
