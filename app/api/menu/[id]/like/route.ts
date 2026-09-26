import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const visitorId = typeof body.visitorId === "string" ? body.visitorId : "";
  if (!/^[A-Za-z0-9_-]{16,100}$/.test(visitorId)) {
    return NextResponse.json({ error: "A valid visitor ID is required" }, { status: 400 });
  }

  const menuItem = await prisma.menuItem.findUnique({ where: { id: params.id }, select: { id: true } });
  if (!menuItem) return NextResponse.json({ error: "Menu item not found" }, { status: 404 });

  const existing = await prisma.menuItemLike.findUnique({
    where: { menuItemId_visitorId: { menuItemId: params.id, visitorId } },
  });
  if (existing) {
    await prisma.menuItemLike.delete({ where: { id: existing.id } });
  } else {
    await prisma.menuItemLike.create({ data: { menuItemId: params.id, visitorId } });
  }

  const [likeCount, liked] = await Promise.all([
    prisma.menuItemLike.count({ where: { menuItemId: params.id } }),
    prisma.menuItemLike.findUnique({
      where: { menuItemId_visitorId: { menuItemId: params.id, visitorId } },
      select: { id: true },
    }),
  ]);
  return NextResponse.json({ likeCount, liked: Boolean(liked) });
}