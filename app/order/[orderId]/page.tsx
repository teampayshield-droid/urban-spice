"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Clock, AlertCircle, UtensilsCrossed } from "lucide-react";
import { formatCurrency, STATUS_STEPS } from "@/lib/utils";

export default function OrderTrackingPage({ params }: { params: { orderId: string } }) {
  const [order, setOrder] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch(`/api/orders/${params.orderId}`, { cache: "no-store" });
        if (!res.ok) {
          if (active) setNotFound(true);
          return;
        }
        const data = await res.json();
        if (active) setOrder(data);
      } catch {}
    }
    load();
    const interval = setInterval(load, 4000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [params.orderId]);

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <AlertCircle size={48} className="text-red-400 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
        <p className="text-white/50">We couldn&apos;t find this order. Please check the link or ask staff for help.</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse w-12 h-12 rounded-full gold-gradient" />
      </div>
    );
  }

  const currentIndex = STATUS_STEPS.findIndex((s) => s.key === order.status);

  return (
    <div className="min-h-screen px-4 py-8 max-w-lg mx-auto">
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-14 h-14 rounded-2xl gold-gradient flex items-center justify-center mb-3">
          <UtensilsCrossed className="text-charcoal-950" size={26} />
        </div>
        <h1 className="text-2xl font-display font-bold text-gold-gradient">Order Confirmed!</h1>
        <p className="text-white/40 text-sm mt-1">Order ID: {order.orderNumber}</p>
      </div>

      <div className="glass rounded-2xl p-5 mb-5">
        <div className="flex justify-between text-sm mb-4">
          <span className="text-white/50">Table Number</span>
          <span className="font-bold text-accent-400">Table {order.table.number}</span>
        </div>
        <div className="flex justify-between text-sm mb-4">
          <span className="text-white/50">Payment</span>
          <span className="font-medium">{order.paymentMethod} · {order.paymentStatus === "PAID" ? "Paid" : "Pay restaurant staff"}</span>
        </div>

        <div className="relative pl-2">
          {STATUS_STEPS.map((step, idx) => {
            const done = idx <= currentIndex;
            const isLast = idx === STATUS_STEPS.length - 1;
            return (
              <div key={step.key} className="flex gap-3 relative">
                <div className="flex flex-col items-center">
                  {done ? (
                    <CheckCircle2 size={22} className="text-accent-400" />
                  ) : (
                    <Circle size={22} className="text-white/20" />
                  )}
                  {!isLast && (
                    <div className={`w-0.5 flex-1 min-h-[28px] ${idx < currentIndex ? "bg-accent-400" : "bg-white/10"}`} />
                  )}
                </div>
                <p className={`pb-7 font-medium ${done ? "text-white" : "text-white/30"}`}>{step.label}</p>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-2 text-sm text-white/50 mt-1 bg-charcoal-800 rounded-xl px-3 py-2">
          <Clock size={14} /> Estimated preparation time: {order.prepTime} minutes
        </div>
      </div>

      <div className="glass rounded-2xl p-5">
        <h2 className="font-semibold mb-3">Order Summary</h2>
        <div className="space-y-2 mb-3">
          {order.items.map((it: any) => (
            <div key={it.id} className="flex justify-between text-sm">
              <span className="text-white/70">{it.quantity} × {it.name}</span>
              <span>{formatCurrency(it.price * it.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 pt-3 space-y-1">
          <div className="flex justify-between text-sm text-white/50">
            <span>Subtotal</span><span>{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-white/50">
            <span>GST</span><span>{formatCurrency(order.gstAmount)}</span>
          </div>
          <div className="flex justify-between font-bold text-lg pt-1">
            <span>Total</span><span className="text-accent-400">{formatCurrency(order.total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
