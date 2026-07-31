import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  DashboardIcon,
  PackageIcon,
  ReceiptIcon,
  POSIcon,
  LogoutIcon,
  StoreIcon,
} from "./ui/Icons";

const ownerLinks = [
  { to: "/", label: "Dashboard", icon: DashboardIcon },
  { to: "/products", label: "Barang", icon: PackageIcon },
  { to: "/reports", label: "Laporan", icon: ReceiptIcon },
];

const kasirLinks = [
  { to: "/pos", label: "POS / Kasir", icon: POSIcon },
];

export default function Sidebar() {
  const { role, logout, userId } = useAuth();
  const links = role === "owner" ? ownerLinks : kasirLinks;

  return (
    <aside className="w-64 bg-stone-950 text-white flex flex-col min-h-screen shrink-0">
      <div className="px-5 h-14 flex items-center gap-2.5 border-b border-stone-800">
        <StoreIcon className="w-5 h-5 text-indigo-400" />
        <div>
          <h1 className="text-sm font-semibold tracking-tight">Toko EMA</h1>
          <p className="text-[10px] text-stone-500 font-medium uppercase tracking-wider">Peralatan Rumah Tangga</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-stone-800 text-white"
                  : "text-stone-400 hover:text-stone-200 hover:bg-stone-800/50"
              }`
            }
          >
            <l.icon className="w-4 h-4 shrink-0" />
            {l.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 py-3 border-t border-stone-800 space-y-1">
        <div className="px-3 py-2 flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-full bg-stone-700 flex items-center justify-center">
            <span className="text-[10px] font-medium text-stone-300">
              {userId ? String(userId).slice(0, 2) : "U"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-stone-300 truncate capitalize">
              {role}
            </p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-stone-500 hover:text-stone-200 hover:bg-stone-800/50 transition-all duration-150 cursor-pointer"
        >
          <LogoutIcon className="w-4 h-4 shrink-0" />
          Keluar
        </button>
      </div>
    </aside>
  );
}
