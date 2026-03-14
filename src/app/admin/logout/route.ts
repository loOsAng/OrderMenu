import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { adminSessionCookieName } from "@/lib/auth";

export async function POST(request: Request) {
  const cookieStore = await cookies();
  cookieStore.delete(adminSessionCookieName);

  return NextResponse.redirect(new URL("/admin/login", request.url));
}
