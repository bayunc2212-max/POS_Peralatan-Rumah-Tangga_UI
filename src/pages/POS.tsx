import { useEffect, useState, useMemo } from "react";
import api from "../services/api";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import Loading from "../components/Loading";
import type { Product, CartItem } from "../types";
import { SearchIcon, MinusIcon, PlusIcon } from "../components/ui/Icons";

export default function POS() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/products").then((res) => {
      setProducts(res.data);
      setLoading(false);
    });
  }, []);

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
        return prev.map((c) =>
          c.product_id === product.id
            ? { ...c, qty: c.qty + 1, subtotal: (c.qty + 1) * c.harga_jual_transaksi }
            : c
        );
      }
      return [
        ...prev,
        {
          product_id: product.id,
          nama_barang: product.nama_barang,
          qty: 1,
          harga_jual_transaksi: product.harga_jual,
          subtotal: product.harga_jual,
        },
      ];
    });
  };

  const updateQty = (productId: number, qty: number) => {
    if (qty < 1) {
      setCart((prev) => prev.filter((c) => c.product_id !== productId));
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
    setCart((prev) =>
      prev.map((c) =>
        c.product_id === productId
          ? { ...c, harga_jual_transaksi: price, subtotal: c.qty * price }
          : c
      )
    );
  };

  const total = useMemo(() => cart.reduce((sum, c) => sum + c.subtotal, 0), [cart]);

  const handleCheckout = async () => {
    if (cart.length === 0) return toast.error("Keranjang masih kosong");
    setSubmitting(true);
    try {
      const res = await api.post("/transactions", {
        items: cart.map((c) => ({
          product_id: c.product_id,
          qty: c.qty,
          harga_jual_transaksi: c.harga_jual_transaksi,
        })),
      });
      toast.success("Transaksi berhasil!");
      setCart([]);
      navigate(`/receipt/${res.data.transaction_id}`);
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Transaksi gagal");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Loading text="Memuat produk..." />;

  return (
    <div className="flex h-[calc(100vh-0px)]">
      {/* Left: Products */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="px-6 pt-5 pb-3 border-b border-stone-100">
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
              className="w-full pl-10 pr-4 py-2.5 text-sm bg-stone-50 border border-stone-200 rounded-lg placeholder:text-stone-400 transition-all duration-150 focus:outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-400/30"
              autoFocus
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filtered.map((p) => (
              <button
                key={p.id}
                onClick={() => addToCart(p)}
                className="bg-white rounded-xl border border-stone-200/70 shadow-sm p-4 text-left hover:shadow-md hover:border-stone-300 transition-all duration-150 cursor-pointer active:scale-[0.98]"
              >
                <div className="w-full aspect-square rounded-lg bg-stone-50 flex items-center justify-center mb-3 overflow-hidden">
                  {p.gambar ? (
                    <img src={p.gambar} alt={p.nama_barang} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-bold text-stone-300">
                      {p.nama_barang.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-stone-900 truncate">{p.nama_barang}</p>
                <p className="text-xs text-stone-400 mt-0.5">Stok: {p.stock}</p>
                <p className="text-sm font-semibold text-stone-900 mt-1.5">
                  Rp {p.harga_jual.toLocaleString("id-ID")}
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

      {/* Right: Cart */}
      <div className="w-96 bg-white border-l border-stone-200/70 flex flex-col shrink-0">
        <div className="px-5 py-4 border-b border-stone-100">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-stone-900">Keranjang</h2>
            {cart.length > 0 && (
              <span className="text-xs bg-stone-900 text-white w-5 h-5 rounded-full flex items-center justify-center font-medium">
                {cart.length}
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-5 text-center">
              <div className="w-14 h-14 rounded-2xl bg-stone-50 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-stone-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
              </div>
              <p className="text-sm text-stone-400">Belum ada barang</p>
              <p className="text-xs text-stone-300 mt-1">Klik produk untuk menambahkan</p>
            </div>
          ) : (
            <div className="px-4 py-3 space-y-2">
              {cart.map((item) => (
                <div
                  key={item.product_id}
                  className="bg-stone-50 rounded-xl p-3.5 animate-fade-in"
                >
                  <div className="flex items-start justify-between mb-2.5">
                    <p className="text-sm font-medium text-stone-900 truncate flex-1 mr-2">
                      {item.nama_barang}
                    </p>
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
                        value={item.harga_jual_transaksi}
                        onChange={(e) =>
                          updatePrice(item.product_id, Number(e.target.value))
                        }
                        className="w-full text-right text-sm font-medium text-stone-900 bg-transparent border-none focus:outline-none px-1 py-1 rounded"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end mt-1.5">
                    <span className="text-xs text-stone-400">
                      Sub: <span className="font-medium text-stone-600">Rp {item.subtotal.toLocaleString("id-ID")}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-stone-100 px-5 py-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-stone-500">Total</span>
            <span className="text-lg font-semibold text-stone-900">
              Rp {total.toLocaleString("id-ID")}
            </span>
          </div>
          <button
            onClick={handleCheckout}
            disabled={submitting || cart.length === 0}
            className="w-full bg-stone-900 text-white py-3 rounded-xl text-sm font-semibold hover:bg-stone-800 active:bg-stone-700 transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
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
      </div>
    </div>
  );
}
