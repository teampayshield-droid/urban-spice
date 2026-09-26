import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeSpecialDiscountDate } from "@/lib/utils";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const data: any = {};
  if (body.name !== undefined) data.name = body.name;
  if (body.description !== undefined) data.description = body.description;
  if (body.price !== undefined) data.price = parseFloat(body.price);
  if (body.imageUrl !== undefined) data.imageUrl = body.imageUrl;
  if (body.isVeg !== undefined) data.isVeg = !!body.isVeg;
  if (body.isAvailable !== undefined) data.isAvailable = !!body.isAvailable;
  if (body.isHotSeller !== undefined) data.isHotSeller = !!body.isHotSeller;
  if (body.isTopSelling !== undefined) data.isTopSelling = !!body.isTopSelling;
  if (body.isRestaurantSpecial !== undefined) data.isRestaurantSpecial = !!body.isRestaurantSpecial;
  if (body.specialDiscountPercent !== undefined) {
    data.specialDiscountPercent = Math.min(100, Math.max(0, Number.parseInt(String(body.specialDiscountPercent), 10) || 0));
  }
  if (body.specialDiscountDate !== undefined) {
    data.specialDiscountDate = normalizeSpecialDiscountDate(body.specialDiscountDate);
  }
  if (body.prepTime !== undefined) data.prepTime = parseInt(body.prepTime);
  if (body.categoryId !== undefined) data.categoryId = body.categoryId;

  const item = await prisma.menuItem.update({ where: { id: params.id }, data });
  return NextResponse.json(item);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.menuItem.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
