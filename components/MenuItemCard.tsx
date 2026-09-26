"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Minus, Flame, TrendingUp, Sparkles, Heart } from "lucide-react";
import { formatCurrency, getActiveSpecialPrice } from "@/lib/utils";
import { getVisitorId } from "@/lib/visitor";
import { useCart } from "@/components/CartContext";
import { MenuItemDTO } from "@/types";

export default function MenuItemCard({ item }: { item: MenuItemDTO }) {
  const { lines, addItem, increment, decrement } = useCart();
  const line = lines.find((l) => l.menuItemId === item.id);
  const qty = line?.quantity || 0;
  const specialPrice = getActiveSpecialPrice(item);
  const hasActiveDiscount = specialPrice < item.price;
  const [likeCount, setLikeCount] = useState(item.likeCount || 0);
  const [liked, setLiked] = useState(Boolean(item.likedByVisitor));
  const [likePending, setLikePending] = useState(false);

  async function toggleLike() {
    if (likePending) return;
    setLikePending(true);
    try {
      const response = await fetch(`/api/menu/${item.id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitorId: getVisitorId() }),
      });
      if (!response.ok) return;
      const result = await response.json();
      setLiked(result.liked);
      setLikeCount(result.likeCount);
    } catch {
      return;
    } finally {
      setLikePending(false);
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`glass rounded-2xl overflow-hidden flex gap-3 p-3 ${!item.isAvailable ? "opacity-50" : ""}`}
    >
      <div className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-charcoal-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
        <div className={`absolute top-1 left-1 w-4 h-4 rounded-sm flex items-center justify-center border ${item.isVeg ? "border-green-500" : "border-red-500"} bg-black/60`}>
          <span className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? "bg-green-500" : "bg-red-500"}`} />
        </div>
      </div>

      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-white leading-snug truncate">{item.name}</h3>
          </div>
          {(item.isHotSeller || item.isTopSelling || item.isRestaurantSpecial) && (
            <div className="flex flex-wrap gap-1 mt-1">
              {item.isHotSeller && <span className="inline-flex items-center gap-1 rounded-full bg-orange-500/15 px-2 py-0.5 text-[10px] font-medium text-orange-300"><Flame size={10} /> Hot Seller</span>}
              {item.isTopSelling && !item.isTopSellingToday && <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-medium text-sky-300"><TrendingUp size={10} /> Top Selling</span>}
              {item.isRestaurantSpecial && <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-medium text-amber-200"><Sparkles size={10} /> Restaurant Special</span>}
            </div>
          )}
          {item.isTopSellingToday && <span className="inline-flex items-center gap-1 mt-1 rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-medium text-sky-300"><TrendingUp size={10} /> Top Selling Today</span>}
          {hasActiveDiscount && <span className="inline-block mt-1 rounded-full bg-rose-500/15 px-2 py-0.5 text-[10px] font-semibold text-rose-300">Today&apos;s Special · {item.specialDiscountPercent}% off</span>}
          <p className="text-xs text-white/45 line-clamp-2 mt-0.5">{item.description}</p>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="font-semibold text-accent-400">{formatCurrency(specialPrice)}</span>
            {hasActiveDiscount && <span className="text-xs text-white/35 line-through">{formatCurrency(item.price)}</span>}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleLike}
              disabled={likePending}
              aria-label={liked ? `Unlike ${item.name}` : `Like ${item.name}`}
              aria-pressed={liked}
              className={`inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs transition ${liked ? "text-rose-300" : "text-white/50 hover:text-rose-300"}`}
            >
              <Heart size={15} fill={liked ? "currentColor" : "none"} /> {likeCount}
            </button>
          {!item.isAvailable ? (
            <span className="text-[11px] px-2 py-1 rounded-full bg-white/5 text-white/40 flex items-center gap-1">
              <Flame size={11} /> Unavailable
            </span>
          ) : qty === 0 ? (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => addItem({ menuItemId: item.id, name: item.name, price: specialPrice, imageUrl: item.imageUrl })}
              className="px-3 py-1.5 rounded-lg gold-gradient text-charcoal-950 text-sm font-semibold flex items-center gap-1"
            >
              <Plus size={14} /> Add
            </motion.button>
          ) : (
            <div className="flex items-center gap-2 bg-charcoal-800 rounded-lg px-1.5 py-1">
              <button onClick={() => decrement(item.id)} className="w-6 h-6 flex items-center justify-center rounded-md bg-charcoal-700 hover:bg-charcoal-700/70">
                <Minus size={12} />
              </button>
              <span className="text-sm font-semibold w-4 text-center">{qty}</span>
              <button onClick={() => increment(item.id)} className="w-6 h-6 flex items-center justify-center rounded-md gold-gradient text-charcoal-950">
                <Plus size={12} />
              </button>
            </div>
          )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
