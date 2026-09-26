export function formatCurrency(amount: number): string {
  return `₹${amount.toFixed(2)}`;
}

export function getTodayDate(): string {
  const date = new Date();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function normalizeSpecialDiscountDate(value: unknown): string | null {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value ? value : null;
}

export function getActiveSpecialPrice(item: {
  price: number;
  specialDiscountPercent: number;
  specialDiscountDate: string | null;
}): number {
  const percent = item.specialDiscountPercent;
  if (item.specialDiscountDate !== getTodayDate() || percent < 1 || percent > 100) return item.price;
  return Number((item.price * (1 - percent / 100)).toFixed(2));
}

export function generateOrderNumber(): string {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const rand = Math.floor(100 + Math.random() * 900);
  return `ORD-${y}${m}${d}-${rand}`;
}

export const STATUS_STEPS = [
  { key: "RECEIVED", label: "Order Received" },
  { key: "PREPARING", label: "Preparing" },
  { key: "READY", label: "Ready" },
  { key: "SERVED", label: "Served" },
];

export function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
