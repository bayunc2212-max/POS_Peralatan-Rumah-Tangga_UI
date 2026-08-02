import { useEffect, useState } from "react";
import api from "../services/api";
import Loading from "../components/Loading";
import type { StockLog } from "../types";
import { Badge } from "../components/ui";
import { HistoryIcon, SearchIcon } from "../components/ui/Icons";

const jenisLabel: Record<StockLog["jenis"], { text: string; variant: "brand" | "success" | "danger" | "warning" | "default" }> = {
  AWAL: { text: "Barang Baru", variant: "brand" },
  MASUK: { text: "Stok Masuk", variant: "success" },
  KELUAR: { text: "Terjual", variant: "danger" },
  EDIT: { text: "Edit Stok", variant: "warning" },
  HAPUS: { text: "Dihapus", variant: "default" },
};

const fmt = (n: number) => (n > 0 ? `+${n}` : `${n}`);

export default function Riwayat() {
  const [logs, setLogs] = useState<StockLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [input, setInput] = useState("");

  const fetchLogs = async (q: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/products/logs?search=${encodeURIComponent(q)}`);
      setLogs(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs("");
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(input);
    fetchLogs(input);
  };

  return (
    <div className="p-4 md:p-6 space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl font-semibold text-stone-900">Riwayat Stok</h1>
        <p className="text-sm text-stone-500 mt-0.5">Semua pergerakan stok barang tercatat</p>
      </div>

      <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-md">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            placeholder="Cari per barang..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-sm bg-white border border-stone-200 rounded-xl placeholder:text-stone-400 transition-all duration-150 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/30"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 text-sm font-medium rounded-xl bg-gradient-to-r from-brand-600 to-sky-500 text-white hover:opacity-90 shadow-md shadow-brand-600/20 transition-all duration-150 cursor-pointer"
        >
          Cari
        </button>
        {search && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setInput("");
              fetchLogs("");
            }}
            className="px-3 py-2 text-sm font-medium rounded-xl bg-white border border-stone-200 text-stone-600 hover:bg-stone-50 transition-all duration-150 cursor-pointer"
          >
            Reset
          </button>
        )}
      </form>

      {loading ? (
        <Loading text="Memuat riwayat..." />
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200/70 shadow-sm overflow-hidden">
          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100">
                  <th className="text-left px-5 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider">Waktu</th>
                  <th className="text-left px-5 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider">Barang</th>
                  <th className="text-left px-5 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider">Jenis</th>
                  <th className="text-right px-5 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider">Perubahan</th>
                  <th className="text-right px-5 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider">Stok</th>
                  <th className="text-left px-5 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider">Sumber</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {logs.map((l) => {
                  const meta = jenisLabel[l.jenis];
                  return (
                    <tr key={l.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-5 py-3 text-stone-500 whitespace-nowrap">
                        {new Date(l.created_at).toLocaleString("id-ID")}
                      </td>
                      <td className="px-5 py-3 font-medium text-stone-900">{l.nama_barang}</td>
                      <td className="px-5 py-3">
                        <Badge variant={meta.variant}>{meta.text}</Badge>
                      </td>
                      <td className={`px-5 py-3 text-right font-semibold whitespace-nowrap ${
                        l.qty_perubahan > 0 ? "text-emerald-600" : l.qty_perubahan < 0 ? "text-red-600" : "text-stone-400"
                      }`}>
                        {fmt(l.qty_perubahan)}
                      </td>
                      <td className="px-5 py-3 text-right text-stone-600 whitespace-nowrap">
                        {l.stok_sebelum} → {l.stok_sesudah}
                      </td>
                      <td className="px-5 py-3 text-stone-500">{l.sumber ?? "-"}</td>
                    </tr>
                  );
                })}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-stone-400">
                      <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-4">
                        <HistoryIcon className="w-6 h-6 text-stone-300" />
                      </div>
                      {search ? "Tidak ada riwayat untuk barang ini" : "Belum ada pergerakan stok"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
