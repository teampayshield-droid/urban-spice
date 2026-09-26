import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const VALID = ["RECEIVED", "PREPARING", "READY", "SERVED"];

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const data: any = {};
  if (body.status !== undefined) {
    if (!VALID.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    data.status = body.status;
  }
  if (body.paymentStatus !== undefined) {
    if (!["PENDING", "PAID"].includes(body.paymentStatus)) {
      return NextResponse.json({ error: "Invalid payment status" }, { status: 400 });
    }
    data.paymentStatus = body.paymentStatus;
  }
  if (body.prepTime !== undefined) {
    const prepTime = Number.parseInt(String(body.prepTime), 10);
    if (!Number.isInteger(prepTime) || prepTime < 1 || prepTime > 240) {
      return NextResponse.json({ error: "Invalid preparation time" }, { status: 400 });
    }
    data.prepTime = prepTime;
  }
  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const order = await prisma.order.update({
    where: { id: params.id },
    data,
    include: { table: true, items: true },
  });
  return NextResponse.json(order);
}
