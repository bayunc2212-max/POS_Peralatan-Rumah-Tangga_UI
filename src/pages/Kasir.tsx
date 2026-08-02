import { useEffect, useState } from "react";
import api from "../services/api";
import Modal from "../components/Modal";
import Loading from "../components/Loading";
import toast from "react-hot-toast";
import { Button, Input, Badge } from "../components/ui";
import { UserPlusIcon, UserIcon, SearchIcon } from "../components/ui/Icons";

interface KasirUser {
  id: number;
  username: string;
  role: string;
}

export default function Kasir() {
  const [users, setUsers] = useState<KasirUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ username: "", password: "", confirm: "" });
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    const res = await api.get("/api/auth/kasir");
    setUsers(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) {
      return toast.error("Password minimal 6 karakter");
    }
    if (form.password !== form.confirm) {
      return toast.error("Konfirmasi password tidak cocok");
    }
    setSaving(true);
    try {
      await api.post("/api/auth/kasir", {
        username: form.username,
        password: form.password,
      });
      toast.success("Akun kasir dibuat");
      setModal(false);
      setForm({ username: "", password: "", confirm: "" });
      fetchUsers();
    } catch (err: any) {
      const msg = err.response?.data?.message;
      if (msg === "USERNAME_SUDAH_ADA") toast.error("Username sudah digunakan");
      else toast.error("Gagal membuat akun");
    } finally {
      setSaving(false);
    }
  };

  const filtered = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Loading text="Memuat akun kasir..." />;

  return (
    <div className="p-4 md:p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-stone-900">Kelola Kasir</h1>
          <p className="text-sm text-stone-500 mt-0.5">{users.length} akun kasir terdaftar</p>
        </div>
        <Button icon={<UserPlusIcon className="w-4 h-4" />} onClick={() => setModal(true)}>
          Tambah Kasir
        </Button>
      </div>

      <div className="relative max-w-xs">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
        <input
          type="text"
          placeholder="Cari kasir..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3.5 py-2 text-sm bg-white border border-stone-200 rounded-xl placeholder:text-stone-400 transition-all duration-150 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/30"
        />
      </div>

      <div className="bg-white rounded-2xl border border-stone-200/70 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-stone-100">
              <th className="text-left px-5 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider">Username</th>
              <th className="text-left px-5 py-3.5 text-xs font-medium text-stone-500 uppercase tracking-wider">Peran</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-50">
            {filtered.map((u) => (
              <tr key={u.id} className="hover:bg-stone-50/50 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-stone-900">{u.username}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <Badge variant="brand">Kasir</Badge>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={2} className="text-center py-12 text-stone-400">
                  {search ? "Kasir tidak ditemukan" : "Belum ada akun kasir"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title="Tambah Akun Kasir">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Username"
            type="text"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            placeholder="Contoh: kasir2"
            required
          />
          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="Minimal 6 karakter"
            hint="Gunakan password yang mudah diingat kasir"
            required
          />
          <Input
            label="Konfirmasi Password"
            type="password"
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            placeholder="Ulangi password"
            required
          />
          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={saving} icon={<UserPlusIcon className="w-4 h-4" />}>
              Buat Akun
            </Button>
            <Button type="button" variant="secondary" onClick={() => setModal(false)}>
              Batal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
