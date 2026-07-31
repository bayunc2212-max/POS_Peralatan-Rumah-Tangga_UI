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
  satuan: string;
  gambar?: string;
}

export interface CartItem {
  product_id: number;
  nama_barang: string;
  qty: number;
  harga_jual_transaksi: number;
  subtotal: number;
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

export interface Receipt {
  toko: string;
  alamat: string;
  header: {
    id: number;
    invoice_number: string;
    total: number;
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
