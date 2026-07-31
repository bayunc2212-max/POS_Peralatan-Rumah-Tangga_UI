import { useEffect, useState } from "react";
import api from "../services/api";
import Loading from "../components/Loading";
import type { TransactionItem } from "../types";
import { Card, Button } from "../components/ui";
import { TrendingUpIcon, DollarIcon, ReceiptIcon, SearchIcon } from "../components/ui/Icons";

export default function Reports() {
  const [data, setData] = useState<TransactionItem[]>([]);
  const [summary, setSummary] = useState<{ total_transaksi: number; total_omzet: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState("");

  const fetchData = async (filterDate?: string) => {
    setLoading(true);
    try {
      if (filterDate) {
        const [d, s] = await Promise.all([
          api.get(`/transactions/report/date?date=${filterDate}`),
          api.get("/transactions/report/summary"),
        ]);
        setData(d.data);
        setSummary(s.data);
      } else {
        const [d, s] = await Promise.all([
          api.get("/transactions/report"),
          api.get("/transactions/report/summary"),
        ]);
        setData(d.data);
        setSummary(s.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData(date || undefined);
  };

  const grouped: Record<number, {
    transaction_id: number;
    total: number;
    created_at: string;
    kasir: string;
    items: TransactionItem[];
  }> = {};
  for (const row of data) {
    if (!grouped[row.transaction_id]) {
      grouped[row.transaction_id] = {
        transaction_id: row.transaction_id,
        total: row.total,
        created_at: row.created_at,
        kasir: row.kasir,
        items: [],
      };
    }
    grouped[row.transaction_id].items.push(row);
  }

  const groups = Object.values(grouped);

  if (loading) return <Loading text="Memuat laporan..." />;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-semibold text-stone-900">Laporan Transaksi</h1>
        <p className="text-sm text-stone-500 mt-0.5">Riwayat dan ringkasan transaksi</p>
      </div>

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">Total Transaksi</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <TrendingUpIcon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-stone-900">{summary.total_transaksi}</p>
          </Card>
          <Card>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">Total Omzet</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <DollarIcon className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-stone-900">
              Rp {Number(summary.total_omzet ?? 0).toLocaleString("id-ID")}
            </p>
          </Card>
        </div>
      )}

      <form onSubmit={handleFilter} className="flex items-end gap-3">
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-stone-500 uppercase tracking-wider">
            Filter Tanggal
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-3.5 py-2.5 text-sm bg-white border border-stone-200 rounded-lg transition-all duration-150 focus:outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-400/30"
          />
        </div>
        <Button type="submit" icon={<SearchIcon className="w-4 h-4" />}>
          Filter
        </Button>
        {date && (
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setDate("");
              fetchData();
            }}
          >
            Reset
          </Button>
        )}
      </form>

      <div className="space-y-3">
        {groups.length === 0 ? (
          <Card className="text-center py-12">
            <div className="w-14 h-14 rounded-2xl bg-stone-50 flex items-center justify-center mx-auto mb-4">
              <ReceiptIcon className="w-6 h-6 text-stone-300" />
            </div>
            <p className="text-sm text-stone-400">Belum ada transaksi</p>
          </Card>
        ) : (
          groups.map((trx) => (
            <Card key={trx.transaction_id} padding={false} className="overflow-hidden">
              <div className="px-5 py-3.5 bg-stone-50/70 border-b border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white border border-stone-200 flex items-center justify-center">
                    <ReceiptIcon className="w-3.5 h-3.5 text-stone-500" />
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-stone-900">
                      Transaksi #{trx.transaction_id}
                    </span>
                    <span className="text-xs text-stone-400 ml-2">
                      {new Date(trx.created_at).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-stone-400">Kasir: {trx.kasir}</p>
                  <p className="text-sm font-bold text-stone-900">
                    Rp {trx.total.toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
              <div className="px-5 py-3">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-xs text-stone-400 uppercase tracking-wider">
                      <th className="text-left py-1.5 font-medium">Barang</th>
                      <th className="text-right py-1.5 font-medium">Qty</th>
                      <th className="text-right py-1.5 font-medium">Harga</th>
                      <th className="text-right py-1.5 font-medium">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    {trx.items.map((item, i) => (
                      <tr key={i}>
                        <td className="py-1.5 text-stone-700">{item.nama_barang}</td>
                        <td className="py-1.5 text-right text-stone-600">{item.qty}</td>
                        <td className="py-1.5 text-right text-stone-500">
                          Rp {item.harga_jual_transaksi.toLocaleString("id-ID")}
                        </td>
                        <td className="py-1.5 text-right font-medium text-stone-900">
                          Rp {item.subtotal.toLocaleString("id-ID")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
