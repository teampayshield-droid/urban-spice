import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const table = await prisma.table.update({
    where: { id: params.id },
    data: { number: parseInt(body.number) },
  });
  return NextResponse.json(table);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await prisma.table.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
