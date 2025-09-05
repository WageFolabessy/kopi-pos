# KopiPOS - Aplikasi Point of Sale untuk Warung Kopi

Aplikasi Point of Sale (POS) modern yang dirancang khusus untuk kebutuhan UMKM warung kopi. Dibangun menggunakan React Native (Expo) dan Firebase, aplikasi ini bertujuan untuk menyediakan solusi kasir yang efisien, andal, dan mudah digunakan.

## Fitur Utama (MVP)

Aplikasi ini dikembangkan dengan fokus pada fungsionalitas inti yang paling dibutuhkan oleh pemilik warung kopi:

-   **Manajemen Produk**:
    -   Operasi CRUD (Create, Read, Update, Delete) untuk produk.
    -   Pengelompokan produk berdasarkan Kategori (Kopi, Non-Kopi, Makanan).
    -   Upload foto untuk setiap produk.
-   **Manajemen Akses Pengguna**:
    -   Sistem peran dengan dua level: **Pemilik (Admin)** dan **Kasir**.
    -   Pemilik memiliki akses penuh ke fitur manajemen, sementara Kasir hanya dapat mengakses modul transaksi.
-   **Modul Kasir (Transaksi)**: *(Dalam Pengembangan)*
    -   Antarmuka kasir yang cepat dan visual.
    -   Dukungan pembayaran Tunai dan QRIS Dinamis (via Midtrans).
-   **Manajemen Inventori**: *(Dalam Pengembangan)*
    -   Pengelolaan stok bahan baku.
    -   Pemotongan stok otomatis berdasarkan resep.
-   **Pelaporan**: *(Dalam Pengembangan)*
    -   Dashboard sederhana untuk memantau performa bisnis.
-   **Mode Offline**:
    -   Kemampuan untuk tetap mencatat transaksi penjualan saat koneksi internet terputus.

## Tumpukan Teknologi (Technology Stack)

-   **Framework**: React Native (Expo)
-   **Bahasa**: TypeScript
-   **Navigasi**: Expo Router (File-based Routing)
-   **Backend & Database**: Google Firebase
    -   **Authentication**: Untuk manajemen login dan hak akses pengguna.
    -   **Firestore**: Database NoSQL real-time untuk data produk, transaksi, dan pengguna.
    -   **Storage**: Untuk menyimpan gambar produk.
-   **Payment Gateway**: Midtrans *(Akan diintegrasikan)*
