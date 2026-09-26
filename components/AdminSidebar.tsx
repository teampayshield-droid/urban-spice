"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, ClipboardList, UtensilsCrossed, Tag, QrCode, Settings, LogOut, Menu, X,
} from "lucide-react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/menu", label: "Menu", icon: UtensilsCrossed },
  { href: "/admin/categories", label: "Categories", icon: Tag },
  { href: "/admin/tables", label: "Tables", icon: QrCode },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <>
      <div className="md:hidden flex items-center justify-between p-4 border-b border-white/5 glass sticky top-0 z-40">
        <span className="font-display font-bold text-gold-gradient">Urban Spice</span>
        <button onClick={() => setOpen(!open)} className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/5">
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      <aside className={`${open ? "block" : "hidden"} md:block w-full md:w-60 shrink-0 md:h-screen md:sticky md:top-0 border-r border-white/5 bg-charcoal-900/60 p-4`}>
        <div className="hidden md:block mb-8 px-2">
          <h1 className="font-display font-bold text-xl text-gold-gradient">Urban Spice</h1>
          <p className="text-xs text-white/40">Admin Dashboard</p>
        </div>
        <nav className="space-y-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  active ? "gold-gradient text-charcoal-950" : "text-white/60 hover:bg-white/5"
                }`}
              >
                <Icon size={17} /> {item.label}
              </Link>
            );
          })}
        </nav>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-white/5 w-full mt-6"
        >
          <LogOut size={17} /> Logout
        </button>
      </aside>
    </>
  );
}
