# Inventio

Sistem manajemen inventaris berbasis web untuk membantu UMKM dalam mencatat stok masuk dan keluar, memantau persediaan secara real-time, serta menghasilkan laporan inventaris otomatis guna meningkatkan efisiensi operasional dan akurasi data.

---

## Tentang Project

Banyak UMKM masih melakukan pencatatan inventaris secara manual menggunakan buku tulis atau spreadsheet sederhana. Kondisi ini menyebabkan:

* Data stok tidak terstruktur
* Kesalahan pencatatan barang masuk dan keluar
* Sulit melakukan pelacakan inventaris
* Terjadinya overstock maupun stockout
* Proses pelaporan yang memakan waktu

Inventio hadir sebagai solusi berupa sistem manajemen inventaris berbasis web yang memungkinkan pengelolaan stok dilakukan secara terpusat, real-time, dan lebih efisien.

---

## Fitur Utama

### Manajemen Data Barang

* Pencatatan data barang secara terpusat
* Kategori produk dan informasi stok
* Pengelolaan supplier dan gudang

### Stok Masuk

* Pencatatan penambahan stok
* Riwayat transaksi barang masuk
* Monitoring perubahan stok

### Stok Keluar

* Pencatatan pengeluaran barang
* Pengurangan stok otomatis
* Tracking aktivitas inventaris

### Monitoring Persediaan Real-Time

* Informasi stok terkini
* Pemantauan kondisi inventaris
* Mengurangi kesalahan pencatatan manual

### Laporan Inventaris

* Laporan otomatis berdasarkan transaksi
* Rekap stok barang
* Riwayat pergerakan inventaris

### Notifikasi Stok Minimum

* Peringatan stok hampir habis
* Membantu mencegah stockout

### Analisis Ketersediaan Stok

* Monitoring overstock dan stockout
* Membantu pengambilan keputusan pengadaan barang

### Sistem Berbasis Web

* Dapat diakses dari berbagai perangkat
* Tidak memerlukan instalasi khusus pada client

---

## Tech Stack

### Frontend

* React.js
* Vite
* CSS

### Backend

* Node.js
* Express.js

### Database

* PostgreSQL
* Prisma ORM

### Tools & Services

* Swagger API Documentation
* JWT Authentication
* Nodemon

---

## Struktur Project

```bash
inventio/
├── client/                 # Frontend React + Vite
│   ├── src/
│   ├── public/
│   └── package.json
│
├── server/                 # Backend Express + Prisma
│   ├── controllers/
│   ├── middlewares/
│   ├── prisma/
│   ├── routes/
│   ├── utils/
│   └── package.json
│
├── docs/                   # Dokumentasi project
│   └── assets/
│
└── README.md
```

---

## ERD dan Dokumentasi

Dokumentasi project tersedia pada folder `docs/`.

Beberapa dokumentasi yang tersedia:

* ERD Database
* Use Case Diagram
* Lo-Fi Design
* Dokumentasi Modul

---

## Instalasi dan Menjalankan Project

### 1. Clone Repository

```bash
git clone https://github.com/username/inventio.git
cd inventio
```

---

## Setup Backend

### Masuk ke Folder Server

```bash
cd server
```

### Install Dependencies

```bash
npm install
```

### Setup Environment Variable

Buat file `.env` pada folder `server/` lalu isi dengan konfigurasi berikut:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/nama_database"
JWT_SECRET="your_secret_key"
PORT=3000
```

### Generate Prisma Client

```bash
npx prisma generate
```

### Jalankan Migrasi Database

```bash
npx prisma migrate dev
```

### Menjalankan Server

```bash
npm run dev
```

Server akan berjalan pada:

```bash
http://localhost:3000
```

---

## Setup Frontend

### Masuk ke Folder Client

```bash
cd client
```

### Install Dependencies

```bash
npm install
```

### Jalankan Frontend

```bash
npm run dev
```

Frontend akan berjalan pada:

```bash
http://localhost:5173
```

---

## API Documentation

Backend menyediakan dokumentasi API menggunakan Swagger.

Akses melalui:

```bash
http://localhost:3000/api-docs
```

---

## Fitur Backend yang Tersedia

### Authentication

* Register
* Login
* JWT Authorization

### Inventory Management

* Product Management
* Category Management
* Warehouse Management
* Supplier Management
* Stock Management
* Stock Movement Tracking

### Transaction System

* Transaction Management
* Transaction Type Management

### Additional Features

* Forecast Controller
* Tenant Management
* Subscription System
* Invitation System

---

## Target Pengguna

Inventio ditujukan untuk:

* UMKM
* Toko retail kecil dan menengah
* Bisnis yang membutuhkan monitoring stok sederhana dan efisien

---

## Competitive Advantage

* Fokus pada kebutuhan UMKM
* Antarmuka sederhana dan mudah digunakan
* Fitur inventaris yang esensial tanpa kompleksitas ERP
* Monitoring stok real-time
* Membantu mengurangi overstock dan stockout

---

## Anggota Kelompok

| Nama                   | NIM                | Peran                                           |
| ---------------------- | ------------------ | ----------------------------------------------- |
| Muhammad Haidar Syaafi | 23/521614/TK/57545 | Project Manager, Software Engineer, AI Engineer |
| Rafeyfa Asyla          | 23/512856/TK/56361 | Software Engineer, AI Engineer                  |
| Hammam Priyandono      | 23/521232/TK/57494 | Software Engineer, UI/UX, Cloud Engineer        |

---

## Institusi

Departemen Teknologi Elektro dan Teknologi Informasi
Fakultas Teknik Universitas Gadjah Mada

---

## Status Project

🚧 Project masih dalam tahap pengembangan.

---

## License

Project ini dikembangkan untuk kebutuhan Senior Project / pembelajaran akademik.
