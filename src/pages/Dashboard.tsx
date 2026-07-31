import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";
import Loading from "../components/Loading";
import { PackageIcon, TrendingUpIcon, DollarIcon, POSIcon, ReceiptIcon } from "../components/ui/Icons";

export default function Dashboard() {
  const { role } = useAuth();

  if (role === "kasir") {
    return (
      <div className="p-6 max-w-2xl mx-auto mt-12 animate-fade-in">
        <div className="bg-white rounded-2xl border border-stone-200/70 shadow-sm p-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-5">
            <POSIcon className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-semibold text-stone-900 mb-2">Welcome</h1>
          <p className="text-stone-500 mb-6"> buka menu POS untuk memulai transaksi</p>
          <Link
            to="/pos"
            className="inline-flex items-center gap-2 bg-stone-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-stone-800 transition-all duration-150"
          >
            <POSIcon className="w-4 h-4" />
            Buka POS
          </Link>
        </div>
      </div>
    );
  }

  return <OwnerDashboard />;
}

function OwnerDashboard() {
  const [summary, setSummary] = useState<{ total_transaksi: number; total_omzet: number } | null>(null);
  const [productCount, setProductCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/transactions/report/summary"),
      api.get("/products"),
    ])
      .then(([s, p]) => {
        setSummary(s.data);
        setProductCount(p.data.length);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading text="Memuat dashboard..." />;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-stone-900">Dashboard</h1>
          <p className="text-sm text-stone-500 mt-0.5">Ringkasan bisnis anda</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-stone-200/70 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">Total Produk</span>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <PackageIcon className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-stone-900">{productCount}</p>
        </div>

        <div className="bg-white rounded-xl border border-stone-200/70 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">Total Transaksi</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUpIcon className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-stone-900">{summary?.total_transaksi ?? 0}</p>
        </div>

        <div className="bg-white rounded-xl border border-stone-200/70 shadow-sm p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">Total Omzet</span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <DollarIcon className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-semibold text-stone-900">
            Rp {Number(summary?.total_omzet ?? 0).toLocaleString("id-ID")}
          </p>
        </div>
      </div>

      <h2 className="text-sm font-semibold text-stone-900 pt-2">Menu Cepat</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/products"
          className="bg-white rounded-xl border border-stone-200/70 shadow-sm p-5 hover:shadow-md hover:border-stone-300 transition-all duration-150 flex items-center gap-4 group"
        >
          <div className="w-10 h-10 rounded-lg bg-stone-100 text-stone-600 group-hover:bg-stone-900 group-hover:text-white transition-all duration-150 flex items-center justify-center">
            <PackageIcon className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-stone-900">Kelola Barang</p>
            <p className="text-xs text-stone-500 mt-0.5">Tambah, edit, hapus barang</p>
          </div>
        </Link>
        <Link
          to="/reports"
          className="bg-white rounded-xl border border-stone-200/70 shadow-sm p-5 hover:shadow-md hover:border-stone-300 transition-all duration-150 flex items-center gap-4 group"
        >
          <div className="w-10 h-10 rounded-lg bg-stone-100 text-stone-600 group-hover:bg-stone-900 group-hover:text-white transition-all duration-150 flex items-center justify-center">
            <ReceiptIcon className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-stone-900">Laporan Transaksi</p>
            <p className="text-xs text-stone-500 mt-0.5">Lihat laporan & filter tanggal</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
