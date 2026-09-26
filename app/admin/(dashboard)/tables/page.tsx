"use client";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { Plus, Trash2, Copy, Download, X } from "lucide-react";

export default function AdminTablesPage() {
  const [tables, setTables] = useState<any[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [number, setNumber] = useState("");
  const [origin, setOrigin] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function load() {
    const res = await fetch("/api/tables");
    setTables(await res.json());
  }
  useEffect(() => {
    load();
    setOrigin(window.location.origin);
  }, []);

  async function addTable() {
    const num = parseInt(number);
    if (!num) return;
    const res = await fetch("/api/tables", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ number: num }),
    });
    if (res.ok) {
      setModalOpen(false);
      setNumber("");
      load();
    } else {
      alert("Table number already exists");
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this table?")) return;
    await fetch(`/api/tables/${id}`, { method: "DELETE" });
    load();
  }

  function copyUrl(t: any) {
    const url = `${origin}/menu?table=${t.number}`;
    navigator.clipboard.writeText(url);
    setCopiedId(t.id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  function downloadQR(t: any) {
    const svg = document.getElementById(`qr-${t.id}`);
    if (!svg) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);
    const svgBlob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `table-${t.number}-qr.svg`;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold">Tables</h1>
        <button onClick={() => setModalOpen(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl gold-gradient text-charcoal-950 font-semibold text-sm">
          <Plus size={16} /> Add Table
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {tables.map((t) => (
          <div key={t.id} className="glass rounded-2xl p-4 flex flex-col items-center text-center">
            <p className="font-bold text-lg mb-3">Table {t.number}</p>
            <div className="bg-white p-2 rounded-xl">
              <QRCode id={`qr-${t.id}`} value={`${origin}/menu?table=${t.number}`} size={110} />
            </div>
            <p className="text-[11px] text-white/40 mt-3 break-all">{origin}/menu?table={t.number}</p>
            <div className="flex gap-2 mt-3">
              <button onClick={() => copyUrl(t)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                <Copy size={13} />
              </button>
              <button onClick={() => downloadQR(t)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                <Download size={13} />
              </button>
              <button onClick={() => remove(t.id)} className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-red-400">
                <Trash2 size={13} />
              </button>
            </div>
            {copiedId === t.id && <p className="text-[11px] text-accent-400 mt-1">Copied!</p>}
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-charcoal-900 rounded-2xl p-6 w-full max-w-sm border border-white/10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold text-lg">Add Table</h2>
              <button onClick={() => setModalOpen(false)}><X size={18} /></button>
            </div>
            <input value={number} onChange={(e) => setNumber(e.target.value)} type="number" placeholder="Table number" className="w-full bg-charcoal-800 rounded-lg px-3 py-2 text-sm border border-white/5 mb-4" />
            <button onClick={addTable} className="w-full py-2.5 rounded-xl gold-gradient text-charcoal-950 font-bold">Save</button>
          </div>
        </div>
      )}
    </div>
  );
}
