import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import Loading from "../components/Loading";
import type { Receipt as ReceiptType } from "../types";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui";
import { CheckIcon } from "../components/ui/Icons";

export default function Receipt() {
  const { id } = useParams();
  const { role } = useAuth();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState<ReceiptType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/transactions/receipt/${id}`)
      .then((res) => setReceipt(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loading text="Memuat struk..." />;
  if (!receipt)
    return <p className="p-6 text-center text-stone-400">Struk tidak ditemukan</p>;

  return (
    <div className="p-6 animate-fade-in">
      <div className="max-w-sm mx-auto space-y-5">
        {/* Success banner */}
        <div className="bg-emerald-50 rounded-2xl border border-emerald-200/70 p-5 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <CheckIcon className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-emerald-800">Pembayaran Berhasil</p>
          <p className="text-xs text-emerald-600 mt-0.5">Transaksi telah tercatat</p>
        </div>

        {/* Receipt card */}
        <div className="bg-white rounded-2xl border border-stone-200/70 shadow-sm p-6">
          <div className="text-center mb-4">
            <h2 className="text-base font-bold text-stone-900">{receipt.toko}</h2>
            <p className="text-xs text-stone-400 mt-0.5">{receipt.alamat}</p>
          </div>

          <div className="border-t border-dashed border-stone-200 pt-3 pb-3 space-y-1 text-xs text-stone-600">
            <div className="flex justify-between">
              <span>Nota</span>
              <span className="font-medium text-stone-900">#{receipt.header.invoice_number}</span>
            </div>
            <div className="flex justify-between">
              <span>Kasir</span>
              <span className="font-medium text-stone-900">{receipt.header.kasir}</span>
            </div>
            <div className="flex justify-between">
              <span>Tanggal</span>
              <span className="font-medium text-stone-900">
                {new Date(receipt.header.created_at).toLocaleString("id-ID")}
              </span>
            </div>
          </div>

          <div className="border-t border-dashed border-stone-200 pt-3">
            <div className="flex text-xs font-medium text-stone-400 pb-1.5 uppercase tracking-wider">
              <span className="flex-1">Barang</span>
              <span className="w-12 text-right">Qty</span>
              <span className="w-24 text-right">Subtotal</span>
            </div>
            <div className="space-y-1.5">
              {receipt.items.map((item, i) => (
                <div key={i} className="flex text-xs text-stone-700">
                  <span className="flex-1 truncate">{item.nama_barang}</span>
                  <span className="w-12 text-right">{item.qty}</span>
                  <span className="w-24 text-right font-medium">
                    Rp {item.subtotal.toLocaleString("id-ID")}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-dashed border-stone-200 mt-3 pt-3 flex justify-between items-center">
            <span className="text-xs font-medium text-stone-500">Total</span>
            <span className="text-base font-bold text-stone-900">
              Rp {receipt.header.total.toLocaleString("id-ID")}
            </span>
          </div>

          <p className="text-center text-xs text-stone-400 mt-4">Terima Kasih</p>
        </div>

        <div className="flex gap-2">
          {role === "kasir" && (
            <Button
              variant="primary"
              className="flex-1"
              onClick={() => navigate("/pos")}
            >
              Kembali ke POS
            </Button>
          )}
          {role === "owner" && (
            <Link
              to="/reports"
              className="flex-1 inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 bg-stone-900 text-white hover:bg-stone-800 px-4 py-2.5 text-sm"
            >
              Lihat Laporan
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
