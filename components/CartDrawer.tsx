"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Plus, Minus, ShoppingBag, Loader2, Banknote, QrCode, CreditCard } from "lucide-react";
import { useCart } from "@/components/CartContext";
import { formatCurrency } from "@/lib/utils";
import { useRouter } from "next/navigation";

export default function CartDrawer({
  open,
  onClose,
  tableNumber,
  gstPercent,
}: {
  open: boolean;
  onClose: () => void;
  tableNumber: string;
  gstPercent: number;
}) {
  const { lines, increment, decrement, subtotal, clear } = useCart();
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const router = useRouter();

  const gst = +(subtotal * (gstPercent / 100)).toFixed(2);
  const total = +(subtotal + gst).toFixed(2);

  async function placeOrder() {
    setPlacing(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableNumber: parseInt(tableNumber),
          paymentMethod,
          lines: lines.map((l) => ({ menuItemId: l.menuItemId, quantity: l.quantity })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setPlacing(false);
        return;
      }
      clear();
      router.push(`/order/${data.orderNumber}`);
    } catch (e) {
      setError("Network error. Please try again.");
      setPlacing(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-40"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] bg-charcoal-900 rounded-t-3xl border-t border-white/10 flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <h2 className="font-display text-lg font-bold flex items-center gap-2">
                <ShoppingBag size={18} className="text-accent-400" /> Your Cart
              </h2>
              <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {lines.length === 0 ? (
                <div className="text-center py-16 text-white/40">
                  <ShoppingBag size={40} className="mx-auto mb-3 opacity-30" />
                  Your cart is empty
                </div>
              ) : (
                lines.map((l) => (
                  <div key={l.menuItemId} className="flex items-center gap-3 glass rounded-xl p-2.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={l.imageUrl} alt={l.name} className="w-14 h-14 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{l.name}</p>
                      <p className="text-sm text-white/40">{formatCurrency(l.price)} x {l.quantity} = {formatCurrency(l.price * l.quantity)}</p>
                    </div>
                    <div className="flex items-center gap-2 bg-charcoal-800 rounded-lg px-1.5 py-1">
                      <button onClick={() => decrement(l.menuItemId)} className="w-6 h-6 flex items-center justify-center rounded-md bg-charcoal-700">
                        <Minus size={12} />
                      </button>
                      <span className="text-sm font-semibold w-4 text-center">{l.quantity}</span>
                      <button onClick={() => increment(l.menuItemId)} className="w-6 h-6 flex items-center justify-center rounded-md gold-gradient text-charcoal-950">
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {lines.length > 0 && (
              <div className="p-4 border-t border-white/5 space-y-2">
                <fieldset className="mb-3">
                  <legend className="mb-2 text-sm font-medium">Payment method</legend>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "CASH", label: "Cash", icon: Banknote },
                      { id: "UPI", label: "UPI", icon: QrCode },
                      { id: "CARD", label: "Card", icon: CreditCard },
                    ].map(({ id, label, icon: Icon }) => (
                      <label key={id} className={`flex cursor-pointer flex-col items-center gap-1 rounded-lg border px-2 py-2 text-xs ${paymentMethod === id ? "border-accent-400 text-accent-300" : "border-white/10 text-white/55"}`}>
                        <input className="sr-only" type="radio" name="paymentMethod" value={id} checked={paymentMethod === id} onChange={() => setPaymentMethod(id)} />
                        <Icon size={17} />{label}
                      </label>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-white/40">Pay your selected method with restaurant staff. Payment is not processed online.</p>
                </fieldset>
                <div className="flex justify-between text-sm text-white/60">
                  <span>Subtotal</span><span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm text-white/60">
                  <span>GST ({gstPercent}%)</span><span>{formatCurrency(gst)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-1 border-t border-white/10">
                  <span>Total</span><span className="text-accent-400">{formatCurrency(total)}</span>
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button
                  onClick={placeOrder}
                  disabled={placing}
                  className="w-full mt-2 py-3 rounded-xl gold-gradient text-charcoal-950 font-bold flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {placing ? <Loader2 size={18} className="animate-spin" /> : `Place Order · ${formatCurrency(total)}`}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
