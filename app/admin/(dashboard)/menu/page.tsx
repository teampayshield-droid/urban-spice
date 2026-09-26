"use client";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { formatCurrency, getActiveSpecialPrice, getTodayDate } from "@/lib/utils";

const EMPTY = {
  id: "", name: "", description: "", price: "", imageUrl: "", isVeg: true, isAvailable: true,
  isHotSeller: false, isTopSelling: false, isRestaurantSpecial: false, specialDiscountPercent: "0",
  specialDiscountDate: getTodayDate(), prepTime: "15", categoryId: "",
};

export default function AdminMenuPage() {
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<any>(EMPTY);
  const [editing, setEditing] = useState(false);

  async function load() {
    const [itemsRes, catRes] = await Promise.all([fetch("/api/menu"), fetch("/api/categories")]);
    setItems(await itemsRes.json());
    setCategories(await catRes.json());
  }

  useEffect(() => { load(); }, []);

  function openAdd() {
    setForm({ ...EMPTY, categoryId: categories[0]?.id || "" });
    setEditing(false);
    setModalOpen(true);
  }

  function openEdit(item: any) {
    setForm({
      id: item.id, name: item.name, description: item.description, price: String(item.price),
      imageUrl: item.imageUrl, isVeg: item.isVeg, isAvailable: item.isAvailable,
      isHotSeller: item.isHotSeller, isTopSelling: item.isTopSelling,
      isRestaurantSpecial: item.isRestaurantSpecial,
      specialDiscountPercent: String(item.specialDiscountPercent ?? 0),
      specialDiscountDate: item.specialDiscountDate || "",
      prepTime: String(item.prepTime), categoryId: item.categoryId,
    });
    setEditing(true);
    setModalOpen(true);
  }

  async function save() {
    const method = editing ? "PUT" : "POST";
    const url = editing ? `/api/menu/${form.id}` : "/api/menu";
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setModalOpen(false);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this item?")) return;
    await fetch(`/api/menu/${id}`, { method: "DELETE" });
    load();
  }

  async function toggleAvailable(item: any) {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, isAvailable: !i.isAvailable } : i)));
    await fetch(`/api/menu/${item.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isAvailable: !item.isAvailable }),
    });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold">Menu Management</h1>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-xl gold-gradient text-charcoal-950 font-semibold text-sm">
          <Plus size={16} /> Add Item
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <div key={item.id} className="glass rounded-2xl p-3 flex gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.imageUrl} alt={item.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate">{item.name}</p>
              <p className="text-xs text-white/40 truncate">{item.category?.name}</p>
              <p className="text-accent-400 font-semibold text-sm mt-1">{formatCurrency(item.price)}</p>
              {getActiveSpecialPrice(item) < item.price && <p className="text-xs text-rose-300">Today&apos;s Special · {item.specialDiscountPercent}% off</p>}
              <div className="flex items-center gap-2 mt-2">
                <button onClick={() => toggleAvailable(item)} className={`text-[11px] px-2 py-1 rounded-full font-medium ${item.isAvailable ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                  {item.isAvailable ? "Available" : "Unavailable"}
                </button>
                <button onClick={() => openEdit(item)} className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center">
                  <Pencil size={13} />
                </button>
                <button onClick={() => remove(item.id)} className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-red-400">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-charcoal-900 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto border border-white/10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg">{editing ? "Edit Item" : "Add Item"}</h2>
              <button onClick={() => setModalOpen(false)}><X size={18} /></button>
            </div>
            <div className="space-y-3">
              <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-charcoal-800 rounded-lg px-3 py-2 text-sm border border-white/5" />
              <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full bg-charcoal-800 rounded-lg px-3 py-2 text-sm border border-white/5" rows={2} />
              <input placeholder="Price" type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full bg-charcoal-800 rounded-lg px-3 py-2 text-sm border border-white/5" />
              <input placeholder="Image URL" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} className="w-full bg-charcoal-800 rounded-lg px-3 py-2 text-sm border border-white/5" />
              <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="w-full bg-charcoal-800 rounded-lg px-3 py-2 text-sm border border-white/5">
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select value={form.prepTime} onChange={(e) => setForm({ ...form, prepTime: e.target.value })} className="w-full bg-charcoal-800 rounded-lg px-3 py-2 text-sm border border-white/5">
                {[10,15,20,25,30].map((p) => <option key={p} value={p}>{p} minutes</option>)}
              </select>
              <div className="flex items-center gap-4 text-sm">
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.isVeg} onChange={(e) => setForm({ ...form, isVeg: e.target.checked })} /> Vegetarian</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.isAvailable} onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })} /> Available</label>
              </div>
              <div className="grid grid-cols-1 gap-2 border-t border-white/10 pt-3 text-sm">
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.isHotSeller} onChange={(e) => setForm({ ...form, isHotSeller: e.target.checked })} /> Hot Seller</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.isTopSelling} onChange={(e) => setForm({ ...form, isTopSelling: e.target.checked })} /> Top Selling</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.isRestaurantSpecial} onChange={(e) => setForm({ ...form, isRestaurantSpecial: e.target.checked })} /> Restaurant Special</label>
              </div>
              <div className="grid grid-cols-2 gap-3 border-t border-white/10 pt-3">
                <label className="text-xs text-white/60">Special discount (%)
                  <input type="number" min="0" max="100" step="1" value={form.specialDiscountPercent} onChange={(e) => setForm({ ...form, specialDiscountPercent: e.target.value })} className="mt-1 w-full bg-charcoal-800 rounded-lg px-3 py-2 text-sm text-white border border-white/5" />
                </label>
                <label className="text-xs text-white/60">Discount date
                  <input type="date" value={form.specialDiscountDate} onChange={(e) => setForm({ ...form, specialDiscountDate: e.target.value })} className="mt-1 w-full bg-charcoal-800 rounded-lg px-3 py-2 text-sm text-white border border-white/5" />
                </label>
              </div>
              <button onClick={save} className="w-full py-2.5 rounded-xl gold-gradient text-charcoal-950 font-bold">Save Item</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
