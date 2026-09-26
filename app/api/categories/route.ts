import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const visitorId = req.nextUrl.searchParams.get("visitorId") || "";
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const [categories, orderedLines] = await Promise.all([
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        items: {
          orderBy: { createdAt: "asc" },
          include: {
            _count: { select: { likes: true } },
            likes: { where: { visitorId }, select: { id: true } },
          },
        },
      },
    }),
    prisma.orderItem.findMany({
      where: { order: { createdAt: { gte: startOfDay } }, menuItemId: { not: null } },
      select: { menuItemId: true, quantity: true },
    }),
  ]);
  const dailyCounts = new Map<string, number>();
  for (const line of orderedLines) {
    if (line.menuItemId) dailyCounts.set(line.menuItemId, (dailyCounts.get(line.menuItemId) || 0) + line.quantity);
  }
  const topCount = Math.max(0, ...dailyCounts.values());

  return NextResponse.json(categories.map((category) => ({
    ...category,
    items: category.items.map(({ _count, likes, ...item }) => ({
      ...item,
      likeCount: _count.likes,
      likedByVisitor: likes.length > 0,
      dailyOrderCount: dailyCounts.get(item.id) || 0,
      isTopSellingToday: topCount > 0 && (dailyCounts.get(item.id) || 0) === topCount,
    })),
  })));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.name || typeof body.name !== "string") {
    return NextResponse.json({ error: "Category name is required" }, { status: 400 });
  }
  const count = await prisma.category.count();
  const category = await prisma.category.create({
    data: { name: body.name.trim(), sortOrder: count },
  });
  return NextResponse.json(category);
}
