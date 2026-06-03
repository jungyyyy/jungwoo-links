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
  return contentType.includes("application/json");
}

function setSessionCookie(response: NextResponse) {
  response.cookies.set(ADMIN_COOKIE, ADMIN_COOKIE_VALUE, {
    ...getAdminCookieOptions(),
    maxAge: ADMIN_COOKIE_MAX_AGE,
  });
}

export async function POST(request: Request) {
  try {
    if (!process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: "Admin password is not configured on the server" },
        { status: 503 }
      );
    }

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

    if (jsonResponse) {
      const response = NextResponse.json({ success: true });
      setSessionCookie(response);
      return response;
    }

    const response = NextResponse.redirect(new URL("/admin", request.url));
    setSessionCookie(response);
    return response;
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
