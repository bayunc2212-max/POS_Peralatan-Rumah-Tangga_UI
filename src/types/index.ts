export interface User {
  id: number;
  username: string;
  role: "owner" | "kasir";
}

export interface Product {
  id: number;
  nama_barang: string;
  stock: number;
  harga_beli: number;
  harga_jual: number;
  batas_harga_nego?: number | null;
  satuan: string;
  gambar?: string;
  created_at?: string;
}

export interface CartItem {
  product_id: number;
  nama_barang: string;
  qty: number;
  harga_jual: number;
  batas_harga_nego: number;
  stock: number;
  harga_jual_transaksi: number;
  subtotal: number;
}

export interface StockLog {
  id: number;
  product_id: number;
  jenis: "AWAL" | "MASUK" | "KELUAR" | "EDIT" | "HAPUS";
  qty_perubahan: number;
  stok_sebelum: number;
  stok_sesudah: number;
  sumber: string | null;
  user_id: number | null;
  transaction_id: number | null;
  created_at: string;
  nama_barang: string;
}

export interface TransactionItem {
  transaction_id: number;
  total: number;
  created_at: string;
  kasir: string;
  product_id: number;
  nama_barang: string;
  qty: number;
  harga_jual_transaksi: number;
  subtotal: number;
}

export interface TransactionReport {
  total_transaksi: number;
  total_omzet: number;
}

export interface TopProduct {
  id: number;
  nama_barang: string;
  qty_terjual: number;
  omzet: number;
}

export interface DashboardData {
  today: { transaksi: number; omzet: number };
  month: { transaksi: number; omzet: number };
  summary: { total_transaksi: number; total_omzet: number };
  productCount: number;
  chart: { tanggal: string; omzet: number; transaksi: number }[];
  topToday: TopProduct[];
  topMonth: TopProduct[];
  deadStock: Product[];
  lowStock: Product[];
  newProducts: Product[];
}

export interface SessionTransaction {
  id: number;
  invoice_number: string;
  total: number;
  uang_dibayar: number | null;
  kembalian: number | null;
  original_total: number | null;
  is_negotiated: number;
  created_at: string;
}

export interface KasirSession {
  transactions: SessionTransaction[];
  summary: { total_transaksi: number; total_omzet: number };
}

export interface Receipt {
  toko: string;
  alamat: string;
  header: {
    id: number;
    invoice_number: string;
    total: number;
    uang_dibayar: number | null;
    kembalian: number | null;
    original_total: number | null;
    is_negotiated: number;
    created_at: string;
    kasir: string;
  };
  items: {
    nama_barang: string;
    qty: number;
    harga_jual_transaksi: number;
    subtotal: number;
  }[];
}
