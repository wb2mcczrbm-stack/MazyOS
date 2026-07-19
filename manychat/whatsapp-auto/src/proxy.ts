import { NextRequest, NextResponse } from "next/server";
import { COOKIE, senhaCorreta } from "@/lib/auth";

// Protege as rotas do painel. Sem cookie válido → manda pro /login.
export function proxy(request: NextRequest) {
  const cookie = request.cookies.get(COOKIE)?.value;
  if (senhaCorreta(cookie)) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("proximo", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: "/painel/:path*",
};
