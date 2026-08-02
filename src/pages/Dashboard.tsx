import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";
import Loading from "../components/Loading";
import type { DashboardData } from "../types";
import {
  PackageIcon,
  TrendingUpIcon,
  DollarIcon,
  POSIcon,
  ReceiptIcon,
  BarChartIcon,
  FireIcon,
  AlertIcon,
  TrendingDownIcon,
  HistoryIcon,
} from "../components/ui/Icons";

const statCards = [
  {
    key: "today",
    label: "Penjualan Hari Ini",
    icon: DollarIcon,
    tint: "bg-emerald-50 text-emerald-600",
    value: (d: DashboardData) => `Rp ${d.today.omzet.toLocaleString("id-ID")}`,
    sub: (d: DashboardData) => `${d.today.transaksi} transaksi`,
  },
  {
    key: "month",
    label: "Omzet Bulan Ini",
    icon: TrendingUpIcon,
    tint: "bg-brand-50 text-brand-600",
    value: (d: DashboardData) => `Rp ${d.month.omzet.toLocaleString("id-ID")}`,
    sub: (d: DashboardData) => `${d.month.transaksi} transaksi`,
  },
  {
    key: "transaksi",
    label: "Total Transaksi",
    icon: ReceiptIcon,
    tint: "bg-amber-50 text-amber-600",
    value: (d: DashboardData) => d.summary.total_transaksi.toLocaleString("id-ID"),
    sub: (d: DashboardData) => `Rp ${d.summary.total_omzet.toLocaleString("id-ID")}`,
  },
  {
    key: "produk",
    label: "Total Produk",
    icon: PackageIcon,
    tint: "bg-rose-50 text-rose-600",
    value: (d: DashboardData) => d.productCount.toLocaleString("id-ID"),
    sub: () => "barang terdaftar",
  },
];

const rupiah = (n: number) => `Rp ${Number(n ?? 0).toLocaleString("id-ID")}`;

export default function Dashboard() {
  const { role } = useAuth();

  if (role === "kasir") {
    return (
      <div className="p-6 max-w-2xl mx-auto mt-12 animate-fade-in">
        <div className="bg-white rounded-2xl border border-stone-200/70 shadow-sm p-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-5">
            <POSIcon className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-semibold text-stone-900 mb-2">Welcome</h1>
          <p className="text-stone-500 mb-6"> buka menu POS untuk memulai transaksi</p>
          <Link
            to="/pos"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-600 to-sky-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 shadow-md shadow-brand-600/20 transition-all duration-150"
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
  const { username } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchData = () => {
    setLoading(true);
    setError(false);
    api
      .get("/transactions/report/dashboard")
      .then((res) => setData(res.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <Loading text="Memuat dashboard..." />;

  if (error || !data) {
    return (
      <div className="p-6 max-w-lg mx-auto mt-12 animate-fade-in">
        <div className="bg-white rounded-2xl border border-stone-200/70 shadow-sm p-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-5">
            <AlertIcon className="w-8 h-8" />
          </div>
          <h1 className="text-lg font-semibold text-stone-900 mb-2">Gagal memuat dashboard</h1>
          <p className="text-sm text-stone-500 mb-6">
            Tidak dapat terhubung ke server. Pastikan MySQL (DBngin) dan backend menyala.
          </p>
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-600 to-sky-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:opacity-90 shadow-md shadow-brand-600/20 transition-all duration-150 cursor-pointer"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  const maxChart = Math.max(...data.chart.map((c) => c.omzet), 1);
  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      {/* Greeting */}
      <div className="rounded-2xl bg-gradient-to-r from-brand-600 to-sky-400 p-5 md:p-6 text-white shadow-md shadow-brand-600/20">
        <p className="text-2xl font-bold tracking-tight">
          Halo, {username ?? "Owner"}! 👋
        </p>
        <p className="text-sm text-white/80 mt-1 capitalize">{today}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((s) => (
          <div key={s.key} className="bg-white rounded-2xl border border-stone-200/70 shadow-sm p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">{s.label}</span>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.tint}`}>
                <s.icon className="w-4.5 h-4.5" />
              </div>
            </div>
            <p className="text-xl md:text-2xl font-bold text-stone-900">{s.value(data)}</p>
            <p className="text-xs text-stone-400 mt-1">{s.sub(data)}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-2xl border border-stone-200/70 shadow-sm p-5">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <BarChartIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-stone-900">Grafik Penjualan</h2>
              <p className="text-xs text-stone-400">7 hari terakhir</p>
            </div>
          </div>
        </div>

        {data.chart.length === 0 ? (
          <p className="text-center text-sm text-stone-400 py-10">Belum ada penjualan</p>
        ) : (
          <div className="flex items-end gap-2 md:gap-3 h-44">
            {data.chart.map((c) => (
              <div key={c.tanggal} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                <span className="text-[10px] font-medium text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {rupiah(c.omzet)}
                </span>
                <div
                  className="w-full max-w-12 rounded-t-lg bg-gradient-to-t from-brand-600 to-sky-400 group-hover:opacity-80 transition-opacity"
                  style={{ height: `${Math.max((c.omzet / maxChart) * 100, 4)}%` }}
                  title={`${rupiah(c.omzet)} (${c.transaksi} transaksi)`}
                />
                <span className="text-[10px] text-stone-400 font-medium">
                  {new Date(c.tanggal + "T00:00:00").toLocaleDateString("id-ID", { weekday: "short" })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top selling */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ProductRank title="Terlaris Hari Ini" icon={<FireIcon className="w-4 h-4" />} tint="bg-orange-50 text-orange-600" products={data.topToday} />
        <ProductRank title="Terlaris Bulan Ini" icon={<FireIcon className="w-4 h-4" />} tint="bg-red-50 text-red-600" products={data.topMonth} />
      </div>

      {/* Stock alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StockList
          title="Stok Menipis"
          desc="Stok ≤ 5"
          icon={<AlertIcon className="w-4 h-4" />}
          tint="bg-red-50 text-red-600"
          items={data.lowStock}
          empty="Semua stok aman"
        />
        <StockList
          title="Tidak Terjual 30 Hari"
          desc="Belum ada transaksi 1 bulan terakhir"
          icon={<TrendingDownIcon className="w-4 h-4" />}
          tint="bg-stone-100 text-stone-500"
          items={data.deadStock}
          empty="Semua barang laku terjual"
        />
      </div>

      {/* New products */}
      <div className="bg-white rounded-2xl border border-stone-200/70 shadow-sm p-5">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
            <HistoryIcon className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-stone-900">Riwayat Barang Ditambahkan</h2>
            <p className="text-xs text-stone-400">10 barang terbaru</p>
          </div>
        </div>
        <div className="divide-y divide-stone-50">
          {data.newProducts.length === 0 && (
            <p className="text-sm text-stone-400 py-6 text-center">Belum ada barang</p>
          )}
          {data.newProducts.map((p) => (
            <div key={p.id} className="flex items-center justify-between py-2.5">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-500 shrink-0">
                  {p.nama_barang.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-stone-900 truncate">{p.nama_barang}</p>
                  <p className="text-xs text-stone-400">
                    {p.created_at ? new Date(p.created_at).toLocaleDateString("id-ID") : "-"}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-semibold text-stone-900">{rupiah(p.harga_jual)}</p>
                <p className="text-xs text-stone-400">Stok {p.stock} {p.satuan}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductRank({
  title,
  icon,
  tint,
  products,
}: {
  title: string;
  icon: React.ReactNode;
  tint: string;
  products: { id: number; nama_barang: string; qty_terjual: number; omzet: number }[];
}) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200/70 shadow-sm p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${tint}`}>{icon}</div>
        <div>
          <h2 className="text-sm font-semibold text-stone-900">{title}</h2>
          <p className="text-xs text-stone-400">Berdasarkan jumlah terjual</p>
        </div>
      </div>
      {products.length === 0 ? (
        <p className="text-sm text-stone-400 py-6 text-center">Belum ada penjualan</p>
      ) : (
        <div className="space-y-2">
          {products.map((p, i) => (
            <div key={p.id} className="flex items-center gap-3">
              <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center shrink-0 ${
                i === 0 ? "bg-amber-100 text-amber-700" : "bg-stone-100 text-stone-500"
              }`}>
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-stone-900 truncate">{p.nama_barang}</p>
                <p className="text-xs text-stone-400">{p.qty_terjual} terjual</p>
              </div>
              <span className="text-sm font-semibold text-stone-900 shrink-0">{rupiah(p.omzet)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StockList({
  title,
  desc,
  icon,
  tint,
  items,
  empty,
}: {
  title: string;
  desc: string;
  icon: React.ReactNode;
  tint: string;
  items: { id: number; nama_barang: string; stock: number; satuan: string; harga_jual: number }[];
  empty: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-stone-200/70 shadow-sm p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${tint}`}>{icon}</div>
        <div>
          <h2 className="text-sm font-semibold text-stone-900">{title}</h2>
          <p className="text-xs text-stone-400">{desc}</p>
        </div>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-stone-400 py-6 text-center">{empty}</p>
      ) : (
        <div className="divide-y divide-stone-50">
          {items.slice(0, 6).map((p) => (
            <div key={p.id} className="flex items-center justify-between py-2.5">
              <p className="text-sm font-medium text-stone-900 truncate">{p.nama_barang}</p>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs text-stone-400">{p.satuan}</span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                  p.stock === 0 ? "bg-red-100 text-red-700" : p.stock <= 5 ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"
                }`}>
                  {p.stock}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
