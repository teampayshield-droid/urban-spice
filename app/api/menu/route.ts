import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { normalizeSpecialDiscountDate } from "@/lib/utils";

export async function GET() {
  const items = await prisma.menuItem.findMany({
    include: { category: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (!body.name || !body.categoryId || body.price == null) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  const specialDiscountPercent = Math.min(100, Math.max(0, Number.parseInt(String(body.specialDiscountPercent), 10) || 0));
  const item = await prisma.menuItem.create({
    data: {
      name: body.name,
      description: body.description || "",
      price: parseFloat(body.price),
      imageUrl: body.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600",
      isVeg: !!body.isVeg,
      isAvailable: body.isAvailable ?? true,
      isHotSeller: !!body.isHotSeller,
      isTopSelling: !!body.isTopSelling,
      isRestaurantSpecial: !!body.isRestaurantSpecial,
      specialDiscountPercent,
      specialDiscountDate: specialDiscountPercent > 0 ? normalizeSpecialDiscountDate(body.specialDiscountDate) : null,
      prepTime: parseInt(body.prepTime) || 15,
      categoryId: body.categoryId,
    },
  });
  return NextResponse.json(item);
}
