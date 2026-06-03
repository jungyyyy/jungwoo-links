import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  ADMIN_COOKIE_MAX_AGE,
  ADMIN_COOKIE_VALUE,
  getAdminCookieOptions,
  verifyAdminPassword,
} from "@/lib/auth";

async function getPassword(request: Request): Promise<string | undefined> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const body = await request.json();
    return typeof body.password === "string" ? body.password : undefined;
  }

  const formData = await request.formData();
  const password = formData.get("password");
  return typeof password === "string" ? password : undefined;
}

function wantsJson(request: Request): boolean {
  const contentType = request.headers.get("content-type") ?? "";
  const accept = request.headers.get("accept") ?? "";
  return (
    contentType.includes("application/json") ||
    accept.includes("application/json")
  );
}

export async function POST(request: Request) {
  try {
    const password = await getPassword(request);
    const jsonResponse = wantsJson(request);

    if (!password || !verifyAdminPassword(password)) {
      if (jsonResponse) {
        return NextResponse.json({ error: "Invalid password" }, { status: 401 });
      }
      return NextResponse.redirect(
        new URL("/admin?error=invalid", request.url)
      );
    }

    const response = NextResponse.redirect(new URL("/admin", request.url));
    response.cookies.set(ADMIN_COOKIE, ADMIN_COOKIE_VALUE, {
      ...getAdminCookieOptions(),
      maxAge: ADMIN_COOKIE_MAX_AGE,
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
