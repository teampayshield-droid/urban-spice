import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOrderNumber, getActiveSpecialPrice } from "@/lib/utils";

export async function GET() {
  const orders = await prisma.order.findMany({
    include: { table: true, items: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { tableNumber, lines } = body as {
    tableNumber: number;
    lines: { menuItemId: string; quantity: number }[];
    paymentMethod?: string;
  };
  const paymentMethod = body.paymentMethod || "CASH";

  if (!tableNumber || !Array.isArray(lines) || lines.length === 0) {
    return NextResponse.json({ error: "Invalid order data" }, { status: 400 });
  }
  if (!["CASH", "UPI", "CARD"].includes(paymentMethod)) {
    return NextResponse.json({ error: "Select a valid payment method" }, { status: 400 });
  }

  const table = await prisma.table.findUnique({ where: { number: parseInt(String(tableNumber)) } });
  if (!table) {
    return NextResponse.json({ error: "Invalid table" }, { status: 400 });
  }

  const ids = lines.map((l) => l.menuItemId);
  const menuItems = await prisma.menuItem.findMany({ where: { id: { in: ids } } });

  const orderLines: { menuItemId: string; name: string; price: number; quantity: number }[] = [];
  let maxPrepTime = 10;

  for (const line of lines) {
    const item = menuItems.find((m) => m.id === line.menuItemId);
    const qty = Math.max(1, Math.min(20, parseInt(String(line.quantity)) || 1));
    if (!item) {
      return NextResponse.json({ error: "One or more items no longer exist" }, { status: 400 });
    }
    if (!item.isAvailable) {
      return NextResponse.json({ error: `${item.name} is currently unavailable` }, { status: 400 });
    }
    orderLines.push({ menuItemId: item.id, name: item.name, price: getActiveSpecialPrice(item), quantity: qty });
    if (item.prepTime > maxPrepTime) maxPrepTime = item.prepTime;
  }

  const settings = await prisma.settings.findUnique({ where: { id: "settings" } });
  const gstPercent = settings?.gstPercent ?? 5;

  const subtotal = orderLines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  const gstAmount = +(subtotal * (gstPercent / 100)).toFixed(2);
  const total = +(subtotal + gstAmount).toFixed(2);

  const order = await prisma.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      tableId: table.id,
      subtotal: +subtotal.toFixed(2),
      gstAmount,
      total,
      paymentMethod,
      paymentStatus: "PENDING",
      status: "RECEIVED",
      prepTime: maxPrepTime,
      items: { create: orderLines },
    },
    include: { table: true, items: true },
  });

  return NextResponse.json(order);
}
