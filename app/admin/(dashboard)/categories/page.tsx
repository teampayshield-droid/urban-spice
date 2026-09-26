"use client";
import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/categories");
    setCategories(await res.json());
  }
  useEffect(() => { load(); }, []);

  function openAdd() { setName(""); setEditingId(null); setModalOpen(true); }
  function openEdit(c: any) { setName(c.name); setEditingId(c.id); setModalOpen(true); }

  async function save() {
    if (!name.trim()) return;
    if (editingId) {
      await fetch(`/api/categories/${editingId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }),
      });
    } else {
      await fetch("/api/categories", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }),
      });
    }
    setModalOpen(false);
    load();
  }

  async function remove(id: string) {
    if (!confirm("Delete this category and all its items?")) return;
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold">Categories</h1>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-xl gold-gradient text-charcoal-950 font-semibold text-sm">
          <Plus size={16} /> Add Category
        </button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <div key={c.id} className="glass rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold">{c.name}</p>
              <p className="text-xs text-white/40">{c.items?.length || 0} items</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => openEdit(c)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center"><Pencil size={14} /></button>
              <button onClick={() => remove(c.id)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-red-400"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-charcoal-900 rounded-2xl p-6 w-full max-w-sm border border-white/10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg">{editingId ? "Edit Category" : "Add Category"}</h2>
              <button onClick={() => setModalOpen(false)}><X size={18} /></button>
            </div>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" className="w-full bg-charcoal-800 rounded-lg px-3 py-2 text-sm border border-white/5 mb-4" />
            <button onClick={save} className="w-full py-2.5 rounded-xl gold-gradient text-charcoal-950 font-bold">Save</button>
          </div>
        </div>
      )}
    </div>
  );
}
