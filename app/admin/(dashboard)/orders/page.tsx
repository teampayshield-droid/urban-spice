"use client";
import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/utils";
import { Clock, CreditCard } from "lucide-react";

const STATUSES = ["RECEIVED", "PREPARING", "READY", "SERVED"];
const PREP_OPTIONS = [10, 15, 20, 30];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState("ALL");

  async function load() {
    const res = await fetch("/api/orders", { cache: "no-store" });
    setOrders(await res.json());
  }

  useEffect(() => {
    load();
    const interval = setInterval(load, 4000);
    return () => clearInterval(interval);
  }, []);

  async function updateStatus(id: string, status: string) {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    await fetch(`/api/orders/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  async function updatePrepTime(id: string, prepTime: number) {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, prepTime } : o)));
    await fetch(`/api/orders/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: orders.find((o) => o.id === id)?.status, prepTime }),
    });
  }

  async function updatePaymentStatus(id: string, paymentStatus: string) {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, paymentStatus } : o)));
    await fetch(`/api/orders/${id}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentStatus }),
    });
  }

  const filtered = filter === "ALL" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      <h1 className="text-2xl font-display font-bold mb-6">Orders</h1>

      <div className="flex gap-2 overflow-x-auto mb-5">
        {["ALL", ...STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold ${
              filter === s ? "gold-gradient text-charcoal-950" : "bg-charcoal-800 text-white/60"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((o) => (
          <div key={o.id} className="glass rounded-2xl p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-bold">{o.orderNumber}</p>
                <p className="text-accent-400 font-semibold text-sm">TABLE {o.table.number}</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 font-medium">{o.status}</span>
            </div>

            <div className="space-y-1 my-3">
              {o.items.map((it: any) => (
                <p key={it.id} className="text-sm text-white/70">{it.quantity} × {it.name}</p>
              ))}
            </div>

            <p className="font-bold mb-3">Total {formatCurrency(o.total)}</p>

            <div className="flex items-center justify-between gap-2 mb-3 rounded-lg bg-white/5 px-3 py-2 text-xs">
              <span className="flex items-center gap-2 text-white/65"><CreditCard size={14} /> {o.paymentMethod || "CASH"}</span>
              <button
                type="button"
                onClick={() => updatePaymentStatus(o.id, o.paymentStatus === "PAID" ? "PENDING" : "PAID")}
                className={`rounded-md px-2.5 py-1 font-semibold ${o.paymentStatus === "PAID" ? "bg-green-500/15 text-green-300" : "bg-amber-500/15 text-amber-300"}`}
              >
                {o.paymentStatus === "PAID" ? "Paid" : "Mark paid"}
              </button>
            </div>

            <div className="flex items-center gap-2 mb-3 text-sm text-white/50">
              <Clock size={14} />
              <select
                value={o.prepTime}
                onChange={(e) => updatePrepTime(o.id, parseInt(e.target.value))}
                className="bg-charcoal-800 rounded-lg px-2 py-1 text-xs border border-white/5"
              >
                {PREP_OPTIONS.map((p) => (
                  <option key={p} value={p}>{p} minutes</option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 flex-wrap">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => updateStatus(o.id, s)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium ${
                    o.status === s ? "gold-gradient text-charcoal-950" : "bg-charcoal-800 text-white/60"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-white/40 text-sm">No orders in this category.</p>}
      </div>
    </div>
  );
}
