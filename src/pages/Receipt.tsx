import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import Loading from "../components/Loading";
import type { Receipt as ReceiptType } from "../types";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui";
import { CheckIcon, PrintIcon, TagIcon } from "../components/ui/Icons";

const rupiah = (n: number) => `Rp ${Number(n ?? 0).toLocaleString("id-ID")}`;

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
    <div className="p-4 md:p-6 animate-fade-in">
      <div className="max-w-sm mx-auto space-y-5">
        {/* Success banner */}
        <div className="bg-emerald-50 rounded-2xl border border-emerald-200/70 p-5 text-center no-print">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <CheckIcon className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-emerald-800">Pembayaran Berhasil</p>
          <p className="text-xs text-emerald-600 mt-0.5">Transaksi telah tercatat</p>
        </div>

        {/* Receipt card */}
        <div className="print-area bg-white rounded-2xl border border-stone-200/70 shadow-sm p-6">
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
                <div key={i} className="text-xs text-stone-700">
                  <div className="flex">
                    <span className="flex-1 truncate">{item.nama_barang}</span>
                    <span className="w-12 text-right">{item.qty}</span>
                    <span className="w-24 text-right font-medium">
                      {rupiah(item.subtotal)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-dashed border-stone-200 mt-3 pt-3 space-y-1">
            {receipt.header.is_negotiated === 1 && receipt.header.original_total != null && (
              <div className="flex items-center justify-between text-xs text-stone-400">
                <span className="inline-flex items-center gap-1 text-orange-600 font-semibold">
                  <TagIcon className="w-3 h-3" />
                  Harga Nego
                </span>
                <span className="line-through">{rupiah(receipt.header.original_total)}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-xs font-medium text-stone-500">Total</span>
              <span className="text-base font-bold text-stone-900">
                {rupiah(receipt.header.total)}
              </span>
            </div>
            {receipt.header.uang_dibayar != null && (
              <>
                <div className="flex justify-between text-xs text-stone-500">
                  <span>Tunai</span>
                  <span>{rupiah(receipt.header.uang_dibayar)}</span>
                </div>
                <div className="flex justify-between text-xs font-medium text-emerald-600">
                  <span>Kembalian</span>
                  <span>{rupiah(receipt.header.kembalian ?? 0)}</span>
                </div>
              </>
            )}
          </div>

          <p className="text-center text-xs text-stone-400 mt-4">Terima Kasih</p>
        </div>

        <div className="flex gap-2 no-print">
          <Button
            variant="secondary"
            onClick={() => window.print()}
            icon={<PrintIcon className="w-4 h-4" />}
          >
            Cetak Struk
          </Button>
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
              className="flex-1 inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 bg-gradient-to-r from-brand-600 to-sky-500 text-white hover:opacity-90 px-4 py-2.5 text-sm shadow-md shadow-brand-600/20"
            >
              Lihat Laporan
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
