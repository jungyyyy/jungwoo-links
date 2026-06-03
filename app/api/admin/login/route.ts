import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  ADMIN_COOKIE_MAX_AGE,
  ADMIN_COOKIE_VALUE,
  verifyAdminPassword,
} from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { password } = await request.json();

    if (!password || !verifyAdminPassword(password)) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.set(ADMIN_COOKIE, ADMIN_COOKIE_VALUE, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: ADMIN_COOKIE_MAX_AGE,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
