import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  let settings = await prisma.settings.findUnique({ where: { id: "settings" } });
  if (!settings) {
    settings = await prisma.settings.create({ data: { id: "settings" } });
  }
  return NextResponse.json(settings);
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const settings = await prisma.settings.upsert({
    where: { id: "settings" },
    update: {
      restaurantName: body.restaurantName,
      gstPercent: parseFloat(body.gstPercent),
    },
    create: {
      id: "settings",
      restaurantName: body.restaurantName || "Urban Spice",
      gstPercent: parseFloat(body.gstPercent) || 5,
    },
  });
  return NextResponse.json(settings);
}
