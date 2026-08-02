import { useEffect, useState, useMemo } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Loading from "../components/Loading";
import Modal from "../components/Modal";
import { Button } from "../components/ui";
import { useAuth } from "../context/AuthContext";
import type { Product, CartItem, KasirSession } from "../types";
import {
  SearchIcon,
  MinusIcon,
  PlusIcon,
  CartIcon,
  HistoryIcon,
  TagIcon,
  WalletIcon,
  PrintIcon,
  CheckIcon,
} from "../components/ui/Icons";

const rupiah = (n: number) => `Rp ${Number(n ?? 0).toLocaleString("id-ID")}`;

export default function POS() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [uangDiterima, setUangDiterima] = useState("");
  const [tab, setTab] = useState<"cart" | "session">("cart");
  const navigate = useNavigate();
  const { loginAt } = useAuth();

  const [session, setSession] = useState<KasirSession | null>(null);

  const fetchSession = () => {
    if (!loginAt) return;
    api
      .get(`/transactions/kasir/history?since=${encodeURIComponent(loginAt)}`)
      .then((res) => setSession(res.data));
  };

  useEffect(() => {
    api.get("/products").then((res) => {
      setProducts(res.data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    fetchSession();
  }, [loginAt]);

  const filtered = useMemo(
    () =>
      products.filter((p) =>
        p.nama_barang.toLowerCase().includes(search.toLowerCase())
      ),
    [products, search]
  );

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const exist = prev.find((c) => c.product_id === product.id);
      if (exist) {
        if (exist.qty >= product.stock) {
          toast.error("Stok tidak mencukupi");
          return prev;
        }
        return prev.map((c) =>
          c.product_id === product.id
            ? { ...c, qty: c.qty + 1, subtotal: (c.qty + 1) * c.harga_jual_transaksi }
            : c
        );
      }
      if (product.stock < 1) {
        toast.error("Stok habis");
        return prev;
      }
      return [
        ...prev,
        {
          product_id: product.id,
          nama_barang: product.nama_barang,
          qty: 1,
          harga_jual: product.harga_jual,
          batas_harga_nego: product.batas_harga_nego ?? 0,
          stock: product.stock,
          harga_jual_transaksi: product.harga_jual,
          subtotal: product.harga_jual,
        },
      ];
    });
  };

  const updateQty = (productId: number, qty: number) => {
    const item = cart.find((c) => c.product_id === productId);
    if (!item) return;

    if (qty < 1) {
      setCart((prev) => prev.filter((c) => c.product_id !== productId));
      return;
    }
    if (qty > item.stock) {
      toast.error("Stok tidak mencukupi");
      return;
    }
    setCart((prev) =>
      prev.map((c) =>
        c.product_id === productId
          ? { ...c, qty, subtotal: qty * c.harga_jual_transaksi }
          : c
      )
    );
  };

  const updatePrice = (productId: number, price: number) => {
    const item = cart.find((c) => c.product_id === productId);
    if (!item) return;

    if (price < item.batas_harga_nego) {
      toast.error(`Harga nego tidak boleh di bawah batas (${rupiah(item.batas_harga_nego)})`);
      return;
    }
    setCart((prev) =>
      prev.map((c) =>
        c.product_id === productId
          ? { ...c, harga_jual_transaksi: price, subtotal: c.qty * price }
          : c
      )
    );
  };

  const total = useMemo(() => cart.reduce((sum, c) => sum + c.subtotal, 0), [cart]);
  const uang = Number(uangDiterima) || 0;
  const kembalian = uang - total;

  const handleCheckout = () => {
    if (cart.length === 0) return toast.error("Keranjang masih kosong");
    setUangDiterima("");
    setConfirmOpen(true);
  };

  const confirmPayment = async () => {
    if (uangDiterima !== "" && uang < total) {
      return toast.error("Uang diterima kurang dari total");
    }
    setSubmitting(true);
    try {
      const res = await api.post("/transactions", {
        items: cart.map((c) => ({
          product_id: c.product_id,
          qty: c.qty,
          harga_jual_transaksi: c.harga_jual_transaksi,
        })),
        uang_dibayar: uangDiterima === "" ? null : uang,
      });
      toast.success("Transaksi berhasil!");
      setCart([]);
      setConfirmOpen(false);
      fetchSession();
      navigate(`/receipt/${res.data.transaction_id}`);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      if (msg === "STOK_TIDAK_CUKUP") toast.error("Stok tidak mencukupi");
      else if (msg === "HARGA_DI_BAWAH_BATAS_NEGO") toast.error("Ada harga di bawah batas nego");
      else if (msg === "UANG_KURANG") toast.error("Uang diterima kurang");
      else toast.error(err.response?.data?.message || "Transaksi gagal");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading text="Memuat produk..." />;

  return (
    <div className="flex flex-col md:flex-row md:h-[calc(100vh)]">
      {/* Left: Products */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="px-4 md:px-6 pt-4 md:pt-5 pb-3 border-b border-stone-100 no-print">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-lg font-semibold text-stone-900">POS / Kasir</h1>
            <span className="text-xs text-stone-400 bg-stone-100 px-2.5 py-1 rounded-full font-medium">
              {filtered.length} barang
            </span>
          </div>
          <div className="relative">
            <SearchIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Cari barang..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-xl placeholder:text-stone-400 transition-all duration-150 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/30"
              autoFocus
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin max-h-[50vh] md:max-h-none">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                className="bg-white rounded-2xl border border-stone-200/70 shadow-sm p-4 text-left hover:shadow-md hover:border-brand-200 hover:-translate-y-0.5 transition-all duration-150 cursor-pointer active:scale-[0.98]"
              >
                <div className="w-full aspect-square rounded-xl bg-stone-50 flex items-center justify-center mb-3 overflow-hidden relative">
                  {p.gambar ? (
                    <img src={p.gambar} alt={p.nama_barang} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-stone-300">
                      {p.nama_barang.charAt(0).toUpperCase()}
                    </span>
                  )}
                  {p.stock <= 5 && (
                    <span className={`absolute top-1.5 right-1.5 text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      p.stock === 0 ? "bg-red-500 text-white" : "bg-amber-400 text-white"
                    }`}>
                      {p.stock === 0 ? "HABIS" : `SISA ${p.stock}`}
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-stone-900 truncate">{p.nama_barang}</p>
                <p className="text-xs text-stone-400 mt-0.5">Stok: {p.stock} {p.satuan}</p>
                <p className="text-sm font-semibold text-stone-900 mt-1.5">
                  {rupiah(p.harga_jual)}
                </p>
              </button>
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto mb-4">
                  <SearchIcon className="w-6 h-6 text-stone-400" />
                </div>
                <p className="text-sm text-stone-400">Barang tidak ditemukan</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right: Cart / Session */}
      <div className="w-full md:w-96 bg-white border-t md:border-t-0 md:border-l border-stone-200/70 flex flex-col shrink-0 no-print">
        <div className="px-5 py-4 border-b border-stone-100 flex items-center gap-1">
          <button
            onClick={() => setTab("cart")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
              tab === "cart" ? "bg-brand-50 text-brand-700" : "text-stone-500 hover:bg-stone-100"
            }`}
          >
            <CartIcon className="w-4 h-4" />
            Keranjang
            {cart.length > 0 && (
              <span className="bg-brand-600 text-white w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold">
                {cart.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setTab("session")}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer ${
              tab === "session" ? "bg-brand-50 text-brand-700" : "text-stone-500 hover:bg-stone-100"
            }`}
          >
            <HistoryIcon className="w-4 h-4" />
            Riwayat Sesi
          </button>
        </div>

        {tab === "cart" ? (
          <>
            <div className="flex-1 overflow-y-auto scrollbar-thin max-h-80 md:max-h-none">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-5 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-stone-50 flex items-center justify-center mb-4">
                    <CartIcon className="w-6 h-6 text-stone-300" />
                  </div>
                  <p className="text-sm text-stone-400">Belum ada barang</p>
                  <p className="text-xs text-stone-300 mt-1">Klik produk untuk menambahkan</p>
                </div>
              ) : (
                <div className="px-4 py-3 space-y-2">
                  {cart.map((item) => {
                    const nego = item.harga_jual_transaksi < item.harga_jual;
                    return (
                      <div key={item.product_id} className="bg-stone-50 rounded-xl p-3.5 animate-fade-in">
                        <div className="flex items-start justify-between mb-2.5">
                          <p className="text-sm font-medium text-stone-900 truncate flex-1 mr-2">
                            {item.nama_barang}
                          </p>
                          {nego && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full shrink-0">
                              <TagIcon className="w-3 h-3" />
                              NEGO
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center border border-stone-200 rounded-lg bg-white overflow-hidden">
                            <button
                              onClick={() => updateQty(item.product_id, item.qty - 1)}
                              className="w-8 h-8 flex items-center justify-center text-stone-500 hover:bg-stone-100 transition-colors cursor-pointer"
                            >
                              <MinusIcon className="w-3 h-3" />
                            </button>
                            <span className="w-8 text-center text-sm font-medium text-stone-900">
                              {item.qty}
                            </span>
                            <button
                              onClick={() => updateQty(item.product_id, item.qty + 1)}
                              className="w-8 h-8 flex items-center justify-center text-stone-500 hover:bg-stone-100 transition-colors cursor-pointer"
                            >
                              <PlusIcon className="w-3 h-3" />
                            </button>
                          </div>
                          <div className="flex-1 flex items-center gap-1">
                            <span className="text-xs text-stone-400">Rp</span>
                            <input
                              type="number"
                              min={item.batas_harga_nego}
                              value={item.harga_jual_transaksi}
                              onChange={(e) =>
                                updatePrice(item.product_id, Number(e.target.value))
                              }
                              className="w-full text-right text-sm font-medium text-stone-900 bg-transparent border-none focus:outline-none px-1 py-1 rounded"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end items-center gap-2 mt-1.5">
                          {nego && (
                            <span className="text-xs text-stone-400 line-through">
                              {rupiah(item.harga_jual)}
                            </span>
                          )}
                          <span className="text-xs text-stone-400">
                            Sub: <span className="font-medium text-stone-600">{rupiah(item.subtotal)}</span>
                          </span>
                        </div>
                        <p className="text-[10px] text-stone-400 mt-1 text-right">
                          Batas nego: {rupiah(item.batas_harga_nego)} · Stok: {item.stock}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="border-t border-stone-100 px-5 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-stone-500">Total</span>
                <span className="text-lg font-bold text-stone-900">{rupiah(total)}</span>
              </div>
              <button
                onClick={handleCheckout}
                disabled={submitting || cart.length === 0}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 rounded-xl text-sm font-semibold hover:opacity-90 active:scale-[0.99] transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none cursor-pointer shadow-md shadow-emerald-500/20"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Memproses...
                  </span>
                ) : (
                  "Bayar"
                )}
              </button>
            </div>
          </>
        ) : (
          <SessionPanel session={session} />
        )}
      </div>

      {/* Confirm modal */}
      <Modal open={confirmOpen} onClose={() => !submitting && setConfirmOpen(false)} title="Konfirmasi Pembayaran">
        <div className="space-y-4">
          <div className="max-h-56 overflow-y-auto scrollbar-thin space-y-2">
            {cart.map((item) => (
              <div key={item.product_id} className="flex items-center justify-between text-sm bg-stone-50 rounded-lg px-3 py-2">
                <div className="min-w-0 flex-1 mr-2">
                  <p className="font-medium text-stone-900 truncate">{item.nama_barang}</p>
                  <p className="text-xs text-stone-400">
                    {item.qty} x {rupiah(item.harga_jual_transaksi)}
                    {item.harga_jual_transaksi < item.harga_jual && (
                      <span className="ml-1 line-through">{rupiah(item.harga_jual)}</span>
                    )}
                  </p>
                </div>
                <span className="font-semibold text-stone-900 shrink-0">{rupiah(item.subtotal)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-stone-200 pt-3 flex items-center justify-between">
            <span className="text-sm font-medium text-stone-600">Total</span>
            <span className="text-xl font-bold text-stone-900">{rupiah(total)}</span>
          </div>

          <div className="space-y-1.5">
            <label className="flex items-center gap-2 text-sm font-medium text-stone-700">
              <WalletIcon className="w-4 h-4 text-stone-400" />
              Uang Diterima (Tunai)
            </label>
            <input
              type="number"
              min={total}
              value={uangDiterima}
              onChange={(e) => setUangDiterima(e.target.value)}
              placeholder="Kosongkan jika pas"
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-stone-200 rounded-xl placeholder:text-stone-400 transition-all duration-150 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/30"
              autoFocus
            />
            <p className="text-xs text-stone-400">Kosongkan jika uang pas / tidak diketahui</p>
          </div>

          {uangDiterima !== "" && (
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3">
              <span className="text-sm font-medium text-emerald-700">Kembalian</span>
              <span className={`text-lg font-bold ${kembalian < 0 ? "text-red-600" : "text-emerald-700"}`}>
                {kembalian < 0 ? "Uang kurang" : rupiah(kembalian)}
              </span>
            </div>
          )}

          {uangDiterima !== "" && kembalian < 0 && (
            <p className="text-xs text-red-500">Uang diterima kurang dari total</p>
          )}

          <div className="flex gap-3 pt-1">
            <Button
              onClick={confirmPayment}
              disabled={submitting || (uangDiterima !== "" && kembalian < 0)}
              loading={submitting}
              className="flex-1 !bg-gradient-to-r !from-emerald-500 !to-emerald-600 shadow-md shadow-emerald-500/20"
              icon={<CheckIcon className="w-4 h-4" />}
            >
              Bayar Sekarang
            </Button>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)} disabled={submitting}>
              Batal
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function SessionPanel({ session }: { session: KasirSession | null }) {
  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      <div className="print-area px-5 py-4">
        <div className="text-center mb-4">
          <h3 className="text-sm font-bold text-stone-900">Laporan Sesi Kasir</h3>
          <p className="text-[10px] text-stone-400">
            {session && session.transactions.length > 0
              ? `Mulai ${new Date(session.transactions[session.transactions.length - 1].created_at).toLocaleString("id-ID")}`
              : "Belum ada transaksi"}
          </p>
        </div>

        {session && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-brand-50 rounded-xl p-3 text-center">
              <p className="text-[10px] font-medium text-brand-600 uppercase tracking-wider">Transaksi</p>
              <p className="text-lg font-bold text-brand-700">{session.summary.total_transaksi}</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3 text-center">
              <p className="text-[10px] font-medium text-emerald-600 uppercase tracking-wider">Omzet Sesi</p>
              <p className="text-lg font-bold text-emerald-700">
                {rupiah(session.summary.total_omzet)}
              </p>
            </div>
          </div>
        )}

        {!session || session.transactions.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-14 h-14 rounded-2xl bg-stone-50 flex items-center justify-center mx-auto mb-4">
              <HistoryIcon className="w-6 h-6 text-stone-300" />
            </div>
            <p className="text-sm text-stone-400">Belum ada transaksi pada sesi ini</p>
            <p className="text-xs text-stone-300 mt-1">Transaksi sejak kasir login</p>
          </div>
        ) : (
          <div className="space-y-2">
            {session.transactions.map((t) => (
              <div key={t.id} className="bg-stone-50 rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-semibold text-stone-900">{t.invoice_number}</span>
                  {t.is_negotiated === 1 && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                      <TagIcon className="w-2.5 h-2.5" />
                      NEGO
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-stone-400">
                  <span>{new Date(t.created_at).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</span>
                  <span className="font-bold text-stone-900">{rupiah(t.total)}</span>
                </div>
                {t.uang_dibayar != null && (
                  <p className="text-[10px] text-stone-400 mt-1">
                    Tunai {rupiah(t.uang_dibayar ?? 0)} · Kembali {rupiah(t.kembalian ?? 0)}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-5 pb-4 no-print">
        <button
          onClick={() => window.print()}
          disabled={!session || session.transactions.length === 0}
          className="w-full flex items-center justify-center gap-2 bg-stone-900 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-stone-800 transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
        >
          <PrintIcon className="w-4 h-4" />
          Cetak Laporan Sesi
        </button>
      </div>
    </div>
  );
}
