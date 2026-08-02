import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { StoreIcon, CheckIcon } from "../components/ui/Icons";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(username, password);
      navigate("/");
    } catch {
      toast.error("Login gagal, periksa username & password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen md:flex">
      {/* Branding panel */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-brand-700 via-brand-600 to-sky-400 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/10" />
        <div className="absolute -bottom-32 -left-20 w-96 h-96 rounded-full bg-white/10" />
        <div className="relative m-auto px-12 max-w-md text-white">
          <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center mb-6">
            <StoreIcon className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Toko EMA</h1>
          <p className="mt-2 text-white/80 text-sm">Solusi kasir & manajemen stok peralatan rumah tangga</p>
          <ul className="mt-8 space-y-3">
            {["Kasir cepat & mudah", "Laporan penjualan otomatis", "Catat harga nego & uang kembali"].map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-white/90">
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <CheckIcon className="w-3 h-3" />
                </span>
                {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-4 pt-20 md:pt-0 pb-10">
        <div className="w-full max-w-sm animate-fade-in">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-brand-600 to-sky-400 text-white mb-4 shadow-md md:hidden">
              <StoreIcon className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-stone-900">Masuk ke Toko EMA</h1>
            <p className="text-sm text-stone-500 mt-1">Masuk ke akun anda untuk melanjutkan</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="username" className="block text-sm font-medium text-stone-700">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-stone-200 rounded-xl placeholder:text-stone-400 transition-all duration-150 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/30"
                placeholder="Masukkan username"
                required
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-stone-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-stone-200 rounded-xl placeholder:text-stone-400 transition-all duration-150 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/30"
                placeholder="Masukkan password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-brand-600 to-sky-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 active:scale-[0.99] transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none cursor-pointer shadow-md shadow-brand-600/20"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Memproses...
                </span>
              ) : (
                "Masuk"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
