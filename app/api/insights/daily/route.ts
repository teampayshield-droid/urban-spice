import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTodayDate } from "@/lib/utils";

export async function GET() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [orderedLines, likes] = await Promise.all([
    prisma.orderItem.findMany({
      where: { order: { createdAt: { gte: startOfDay } } },
      select: { menuItemId: true, name: true, quantity: true },
    }),
    prisma.menuItemLike.findMany({
      include: { menuItem: { select: { id: true, name: true } } },
    }),
  ]);

  const orderedCounts = new Map<string, { menuItemId: string | null; name: string; quantity: number }>();
  for (const line of orderedLines) {
    const key = line.menuItemId || line.name;
    const current = orderedCounts.get(key) || { menuItemId: line.menuItemId, name: line.name, quantity: 0 };
    current.quantity += line.quantity;
    orderedCounts.set(key, current);
  }

  const likeCounts = new Map<string, { menuItemId: string; name: string; likes: number }>();
  for (const like of likes) {
    const current = likeCounts.get(like.menuItemId) || {
      menuItemId: like.menuItemId,
      name: like.menuItem.name,
      likes: 0,
    };
    current.likes += 1;
    likeCounts.set(like.menuItemId, current);
  }

  const topSelling = [...orderedCounts.values()]
    .sort((a, b) => b.quantity - a.quantity || a.name.localeCompare(b.name))
    .slice(0, 5);
  const mostLiked = [...likeCounts.values()]
    .sort((a, b) => b.likes - a.likes || a.name.localeCompare(b.name))
    .slice(0, 5);

  return NextResponse.json({
    date: getTodayDate(),
    topSelling,
    mostLiked,
    totalItemsOrdered: orderedLines.reduce((sum, line) => sum + line.quantity, 0),
    totalLikes: likes.length,
  });
}