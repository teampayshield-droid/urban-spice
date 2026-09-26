import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const tables = await prisma.table.findMany({ orderBy: { number: "asc" } });
  return NextResponse.json(tables);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const number = parseInt(body.number);
  if (!number || number < 1) {
    return NextResponse.json({ error: "Valid table number required" }, { status: 400 });
  }
  const existing = await prisma.table.findUnique({ where: { number } });
  if (existing) {
    return NextResponse.json({ error: "Table number already exists" }, { status: 400 });
  }
  const table = await prisma.table.create({ data: { number } });
  return NextResponse.json(table);
}
