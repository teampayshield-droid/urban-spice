"use client";
import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Search, ShoppingBag, UtensilsCrossed, AlertCircle } from "lucide-react";
import { CartProvider, useCart } from "@/components/CartContext";
import MenuItemCard from "@/components/MenuItemCard";
import CartDrawer from "@/components/CartDrawer";
import DishGuide from "@/components/DishGuide";
import { getVisitorId } from "@/lib/visitor";
import { CategoryDTO } from "@/types";

function MenuContent({ tableNumber }: { tableNumber: string }) {
  const [categories, setCategories] = useState<CategoryDTO[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [tableValid, setTableValid] = useState<boolean | null>(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [gstPercent, setGstPercent] = useState(5);
  const { count, subtotal } = useCart();

  useEffect(() => {
    async function load() {
      const visitorId = getVisitorId();
      const [tablesRes, catRes, settingsRes] = await Promise.all([
        fetch("/api/tables"),
        fetch(`/api/categories?visitorId=${encodeURIComponent(visitorId)}`),
        fetch("/api/settings"),
      ]);
      const tables = await tablesRes.json();
      const cats = await catRes.json();
      const settings = await settingsRes.json();
      const valid = tables.some((t: any) => String(t.number) === tableNumber);
      setTableValid(valid);
      setCategories(cats);
      setGstPercent(settings.gstPercent);
      if (cats.length > 0) setActiveCategory(cats[0].id);
      setLoading(false);
    }
    load();
  }, [tableNumber]);

  const filteredItems = useMemo(() => {
    let items = categories.flatMap((c) => c.items.map((i) => ({ ...i, categoryId: c.id })));
    if (activeCategory !== "all") items = items.filter((i) => i.categoryId === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter((i) => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
    }
    return items;
  }, [categories, activeCategory, search]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full gold-gradient" />
          <p className="text-white/50 text-sm">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (!tableValid) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <AlertCircle size={48} className="text-red-400 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Table Not Found</h1>
        <p className="text-white/50 max-w-sm">This table QR code isn&apos;t recognized. Please ask restaurant staff for assistance.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28">
      <header className="sticky top-0 z-30 glass px-4 pt-5 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl gold-gradient flex items-center justify-center">
              <UtensilsCrossed size={18} className="text-charcoal-950" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg leading-none text-gold-gradient">Urban Spice</h1>
              <p className="text-[11px] text-white/40 mt-0.5">Table {tableNumber}</p>
            </div>
          </div>
        </div>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dishes..."
            className="w-full bg-charcoal-800 rounded-xl pl-9 pr-4 py-2.5 text-sm placeholder:text-white/30 border border-white/5"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto mt-4 pb-1 scrollbar-none">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition ${
                activeCategory === c.id ? "gold-gradient text-charcoal-950" : "bg-charcoal-800 text-white/60"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </header>

      <div className="px-4 pt-4 space-y-3">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 text-white/40">No dishes found.</div>
        ) : (
          filteredItems.map((item) => <MenuItemCard key={item.id} item={item} />)
        )}
      </div>

      {count > 0 && (
        <motion.button
          initial={{ y: 80 }}
          animate={{ y: 0 }}
          onClick={() => setCartOpen(true)}
          className="fixed bottom-5 left-4 right-4 z-30 gold-gradient text-charcoal-950 rounded-2xl py-4 px-5 flex items-center justify-between font-bold shadow-xl shadow-black/40"
        >
          <span className="flex items-center gap-2"><ShoppingBag size={18} /> {count} item{count > 1 ? "s" : ""}</span>
          <span>View Cart · ₹{subtotal.toFixed(0)}</span>
        </motion.button>
      )}

      <DishGuide items={categories.flatMap((category) => category.items)} />
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} tableNumber={tableNumber} gstPercent={gstPercent} />
    </div>
  );
}

function MenuPageInner() {
  const params = useSearchParams();
  const tableNumber = params.get("table") || "";

  if (!tableNumber) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <AlertCircle size={48} className="text-red-400 mb-4" />
        <h1 className="text-2xl font-bold mb-2">No Table Selected</h1>
        <p className="text-white/50 max-w-sm">Please scan the QR code on your table to view the menu.</p>
      </div>
    );
  }

  return (
    <CartProvider tableNumber={tableNumber}>
      <MenuContent tableNumber={tableNumber} />
    </CartProvider>
  );
}

export default function MenuPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <MenuPageInner />
    </Suspense>
  );
}
