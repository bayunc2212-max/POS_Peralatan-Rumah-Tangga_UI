import { useEffect, useState, useRef } from "react";
import api from "../services/api";
import Modal from "../components/Modal";
import Loading from "../components/Loading";
import toast from "react-hot-toast";
import type { Product } from "../types";
import { Button, Input, Badge } from "../components/ui";
import { PlusIcon, EditIcon, TrashIcon, SearchIcon, CloseIcon } from "../components/ui/Icons";

const emptyForm = { nama_barang: "", stock: 0, harga_beli: 0, harga_jual: 0, satuan: "", gambar: "" };

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await api.post("/upload", fd);
      setForm((prev) => ({ ...prev, gambar: "http://localhost:3000" + res.data.url }));
      toast.success("Gambar berhasil diupload");
    } catch {
      toast.error("Gagal upload gambar");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const fetchProducts = async () => {
    const res = await api.get("/products");
    setProducts(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const openAdd = () => {
    setForm(emptyForm);
    setEditId(null);
    setModal(true);
  };

  const openEdit = (p: Product) => {
    setForm({
      nama_barang: p.nama_barang,
      stock: p.stock,
      harga_beli: p.harga_beli,
      harga_jual: p.harga_jual,
      satuan: p.satuan,
      gambar: p.gambar ?? "",
    });
    setEditId(p.id);
    setModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/products/${editId}`, form);
        toast.success("Barang diupdate");
      } else {
        await api.post("/products", form);
        toast.success("Barang ditambahkan");
      }
      setModal(false);
      fetchProducts();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      if (msg === "NAMA_BARANG_SUDAH_ADA") toast.error("Nama barang sudah ada");
      else toast.error("Gagal menyimpan barang");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin hapus barang ini?")) return;
    try {
      await api.delete(`/products/${id}`);
      toast.success("Barang dihapus");
      fetchProducts();
    } catch {
      toast.error("Gagal menghapus");
    }
  };

  const filtered = products.filter((p) =>
    p.nama_barang.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Loading text="Memuat barang..." />;

  return (
    <div className="p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-stone-900">Barang</h1>
          <p className="text-sm text-stone-500 mt-0.5">
            {products.length} barang terdaftar
          </p>
        </div>
        <Button icon={<PlusIcon className="w-4 h-4" />} onClick={openAdd}>
          Tambah Barang
        </Button>
      </div>

      <div className="relative max-w-xs">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input
          type="text"
          placeholder="Cari barang..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3.5 py-2 text-sm bg-white border border-stone-200 rounded-lg placeholder:text-stone-400 transition-all duration-150 focus:outline-none focus:border-stone-400 focus:ring-2 focus:ring-stone-400/30"
        />
      </div>

      <div className="bg-white rounded-xl border border-stone-200/70 shadow-sm overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-100">
                <th className="text-left px-5 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider">Nama</th>
                <th className="text-center px-5 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider">Gambar</th>
                <th className="text-left px-5 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider">Satuan</th>
                <th className="text-right px-5 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider">Stok</th>
                <th className="text-right px-5 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider">Harga Beli</th>
                <th className="text-right px-5 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider">Harga Jual</th>
                <th className="text-center px-5 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-stone-50/50 transition-colors">
                  <td className="px-5 py-3.5 font-medium text-stone-900">{p.nama_barang}</td>
                  <td className="px-5 py-3.5 text-center">
                    {p.gambar ? (
                      <img src={p.gambar} alt={p.nama_barang} className="w-8 h-8 rounded-lg object-cover mx-auto" />
                    ) : (
                      <span className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-xs font-bold text-stone-400 mx-auto">
                        {p.nama_barang.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-stone-500">{p.satuan}</td>
                  <td className="px-5 py-3.5 text-right">
                    <Badge variant={p.stock <= 5 ? "danger" : p.stock <= 20 ? "warning" : "success"}>
                      {p.stock}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 text-right text-stone-700">Rp {p.harga_beli.toLocaleString("id-ID")}</td>
                  <td className="px-5 py-3.5 text-right font-medium text-stone-900">Rp {p.harga_jual.toLocaleString("id-ID")}</td>
                  <td className="px-5 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => openEdit(p)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <EditIcon className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Hapus"
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-stone-400">
                    {search ? "Barang tidak ditemukan" : "Belum ada barang"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editId ? "Edit Barang" : "Tambah Barang"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nama Barang"
            type="text"
            value={form.nama_barang}
            onChange={(e) => setForm({ ...form, nama_barang: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Stok"
              type="number"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
              required
            />
            <Input
              label="Satuan"
              type="text"
              value={form.satuan}
              onChange={(e) => setForm({ ...form, satuan: e.target.value })}
              placeholder="pcs / kg / liter"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Harga Beli"
              type="number"
              value={form.harga_beli}
              onChange={(e) => setForm({ ...form, harga_beli: Number(e.target.value) })}
              required
            />
            <Input
              label="Harga Jual"
              type="number"
              value={form.harga_jual}
              onChange={(e) => setForm({ ...form, harga_jual: Number(e.target.value) })}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-stone-700">Gambar</label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
            />
            {form.gambar ? (
              <div className="relative w-32 h-32 rounded-xl border border-stone-200 overflow-hidden">
                <img src={form.gambar} alt="preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, gambar: "" }))}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors cursor-pointer"
                >
                  <CloseIcon className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="w-32 h-32 rounded-xl border-2 border-dashed border-stone-200 flex flex-col items-center justify-center gap-1.5 text-stone-400 hover:border-stone-400 hover:text-stone-500 transition-all duration-150 cursor-pointer disabled:opacity-50"
              >
                {uploading ? (
                  <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <>
                    <PlusIcon className="w-5 h-5" />
                    <span className="text-xs">Upload</span>
                  </>
                )}
              </button>
            )}
            <p className="text-xs text-stone-400">Format: JPG, PNG. Maks 2MB</p>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit">{editId ? "Simpan" : "Tambah"}</Button>
            <Button type="button" variant="secondary" onClick={() => setModal(false)}>
              Batal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
