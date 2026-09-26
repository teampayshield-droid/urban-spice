"use client";
import { useEffect, useState } from "react";
import { ClipboardList, Clock, Flame, CheckCircle2, TrendingUp, Heart } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

function StatCard({ icon: Icon, label, value, accent }: any) {
  return (
    <div className="glass rounded-2xl p-4 flex items-center gap-3">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${accent}`}>
        <Icon size={20} className="text-charcoal-950" />
      </div>
      <div>
        <p className="text-xs text-white/40">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [ordersRes, insightsRes] = await Promise.all([
        fetch("/api/orders", { cache: "no-store" }),
        fetch("/api/insights/daily", { cache: "no-store" }),
      ]);
      const [ordersData, insightsData] = await Promise.all([ordersRes.json(), insightsRes.json()]);
      setOrders(ordersData);
      setInsights(insightsData);
      setLoading(false);
    }
    load();
    const interval = setInterval(load, 5000);
    return () => clearInterval(interval);
  }, []);

  const today = new Date().toDateString();
  const todayOrders = orders.filter((o) => new Date(o.createdAt).toDateString() === today);
  const pending = orders.filter((o) => o.status === "RECEIVED").length;
  const preparing = orders.filter((o) => o.status === "PREPARING").length;
  const ready = orders.filter((o) => o.status === "READY").length;
  const todaySales = todayOrders.reduce((s, o) => s + o.total, 0);

  if (loading) return <div className="animate-pulse text-white/40">Loading dashboard...</div>;

  return (
    <div>
      <h1 className="text-2xl font-display font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-8">
        <StatCard icon={ClipboardList} label="Today's Orders" value={todayOrders.length} accent="gold-gradient" />
        <StatCard icon={Clock} label="Pending" value={pending} accent="bg-amber-300" />
        <StatCard icon={Flame} label="Preparing" value={preparing} accent="bg-orange-400" />
        <StatCard icon={CheckCircle2} label="Ready" value={ready} accent="bg-green-400" />
        <StatCard icon={TrendingUp} label="Today's Sales" value={formatCurrency(todaySales)} accent="gold-gradient" />
      </div>

      <section className="grid gap-4 lg:grid-cols-2 mb-8">
        <div className="glass rounded-2xl p-5">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><TrendingUp size={17} className="text-accent-400" /> Top Selling Today</h2>
          <div className="space-y-3">
            {insights?.topSelling?.map((item: any, index: number) => (
              <div key={item.menuItemId || item.name} className="flex items-center justify-between gap-3 text-sm">
                <span className="min-w-0 truncate"><span className="mr-2 text-white/35">{index + 1}.</span>{item.name}</span>
                <span className="shrink-0 text-white/55">{item.quantity} sold</span>
              </div>
            ))}
            {insights?.topSelling?.length === 0 && <p className="text-sm text-white/40">No items ordered today yet.</p>}
          </div>
        </div>
        <div className="glass rounded-2xl p-5">
          <h2 className="font-semibold mb-4 flex items-center gap-2"><Heart size={17} className="text-rose-300" /> Most Liked</h2>
          <div className="space-y-3">
            {insights?.mostLiked?.map((item: any, index: number) => (
              <div key={item.menuItemId} className="flex items-center justify-between gap-3 text-sm">
                <span className="min-w-0 truncate"><span className="mr-2 text-white/35">{index + 1}.</span>{item.name}</span>
                <span className="shrink-0 text-white/55">{item.likes} {item.likes === 1 ? "like" : "likes"}</span>
              </div>
            ))}
            {insights?.mostLiked?.length === 0 && <p className="text-sm text-white/40">No customer likes yet.</p>}
          </div>
        </div>
      </section>

      <div className="glass rounded-2xl p-5">
        <h2 className="font-semibold mb-4">Recent Orders</h2>
        <div className="space-y-3">
          {orders.slice(0, 8).map((o) => (
            <div key={o.id} className="flex items-center justify-between border-b border-white/5 pb-3 last:border-0 last:pb-0">
              <div>
                <p className="font-medium">{o.orderNumber} <span className="text-white/40">· Table {o.table.number}</span></p>
                <p className="text-xs text-white/40">{o.items.length} item(s) · {formatCurrency(o.total)}</p>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-full bg-white/5 text-accent-400 font-medium">{o.status}</span>
            </div>
          ))}
          {orders.length === 0 && <p className="text-white/40 text-sm">No orders yet.</p>}
        </div>
      </div>
    </div>
  );
}
