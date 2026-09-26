import { NextRequest, NextResponse } from "next/server";
import { setAdminSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, password } = body;
  const validEmail = process.env.ADMIN_EMAIL || "admin@restaurant.com";
  const validPassword = process.env.ADMIN_PASSWORD || "admin123";

  if (email === validEmail && password === validPassword) {
    setAdminSession();
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
}
