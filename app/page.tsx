import Link from "next/link";
import { QrCode, LayoutDashboard, UtensilsCrossed } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center bg-gradient-to-b from-charcoal-950 via-charcoal-900 to-charcoal-950">
      <div className="w-16 h-16 rounded-2xl gold-gradient flex items-center justify-center mb-6 shadow-lg shadow-accent-500/20">
        <UtensilsCrossed className="text-charcoal-950" size={30} />
      </div>
      <h1 className="text-4xl md:text-5xl font-display font-bold text-gold-gradient mb-3">Urban Spice</h1>
      <p className="text-white/50 mb-10 max-w-md">Scan the QR code at your table to view the menu and place your order instantly.</p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link href="/menu?table=1" className="flex items-center gap-2 px-6 py-3 rounded-xl gold-gradient text-charcoal-950 font-semibold hover:opacity-90 transition">
          <QrCode size={18} /> View Demo Menu (Table 1)
        </Link>
        <Link href="/admin/login" className="flex items-center gap-2 px-6 py-3 rounded-xl glass text-white font-semibold hover:bg-white/5 transition">
          <LayoutDashboard size={18} /> Restaurant Admin
        </Link>
      </div>
    </main>
  );
}
