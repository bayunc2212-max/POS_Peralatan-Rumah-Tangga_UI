import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  DashboardIcon,
  PackageIcon,
  ReceiptIcon,
  POSIcon,
  LogoutIcon,
  StoreIcon,
  UserIcon,
  MenuIcon,
  CloseIcon,
  HistoryIcon,
} from "./ui/Icons";

const ownerLinks = [
  { to: "/", label: "Dashboard", icon: DashboardIcon },
  { to: "/products", label: "Barang", icon: PackageIcon },
  { to: "/riwayat", label: "Riwayat Stok", icon: HistoryIcon },
  { to: "/reports", label: "Laporan", icon: ReceiptIcon },
  { to: "/kasir", label: "Kasir", icon: UserIcon },
];

const kasirLinks = [
  { to: "/pos", label: "POS / Kasir", icon: POSIcon },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 bg-white border-b border-stone-200 h-14 flex items-center px-4 gap-3 no-print">
        <button
          onClick={() => setOpen(true)}
          className="p-2 -ml-2 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
        >
          <MenuIcon className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-600 to-sky-400 text-white flex items-center justify-center">
            <StoreIcon className="w-4 h-4" />
          </div>
          <div>
            <p className="text-sm font-semibold text-stone-900 leading-tight">Toko EMA</p>
            <p className="text-[10px] text-stone-400 font-medium uppercase tracking-wider">Peralatan Rumah Tangga</p>
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 no-print">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 animate-slide-in-right" style={{ animationDirection: "reverse" }}>
            <SidebarContent onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:block w-64 shrink-0 no-print">
        <SidebarContent />
      </div>
    </>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const { role, logout, username } = useAuth();
  const links = role === "owner" ? ownerLinks : kasirLinks;

  return (
    <aside className="w-64 bg-white border-r border-stone-200 flex flex-col h-screen shrink-0">
      <div className="px-5 h-14 flex items-center gap-2.5 border-b border-stone-100">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-600 to-sky-400 text-white flex items-center justify-center shadow-sm">
          <StoreIcon className="w-4.5 h-4.5" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-sm font-bold tracking-tight text-stone-900 truncate">Toko EMA</h1>
          <p className="text-[10px] text-stone-400 font-medium uppercase tracking-wider truncate">
            Peralatan Rumah Tangga
          </p>
        </div>
        {onNavigate && (
          <button
            onClick={onNavigate}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <CloseIcon className="w-4 h-4" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-brand-50 text-brand-700"
                  : "text-stone-500 hover:text-stone-900 hover:bg-stone-100"
              }`
            }
          >
            <l.icon className="w-4 h-4 shrink-0" />
            {l.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-3 border-t border-stone-100 space-y-1">
        <div className="px-3 py-2 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-sky-400 text-white flex items-center justify-center shrink-0">
            <span className="text-[11px] font-semibold">
              {(username ?? "U").slice(0, 2).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-stone-800 truncate capitalize">{username ?? role}</p>
            <p className="text-[10px] text-stone-400 capitalize">{role}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-stone-500 hover:text-red-600 hover:bg-red-50 transition-all duration-150 cursor-pointer"
        >
          <LogoutIcon className="w-4 h-4 shrink-0" />
          Keluar
        </button>
      </div>
    </aside>
  );
}
