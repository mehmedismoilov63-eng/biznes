import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

const AUTH_PAGES = ["/login", "/register", "/verify-otp"];
const ALWAYS_PUBLIC = ["/share/"];
const AUTH_COOKIE = "bj_access";

function isAuthPage(path: string): boolean {
  return AUTH_PAGES.some((p) => path === p || path.startsWith(p + "/"));
}

function isAlwaysPublic(pathname: string): boolean {
  return ALWAYS_PUBLIC.some((p) => pathname.includes(p));
}

function stripLocale(pathname: string): string {
  const locales = ["uz-Latn", "uz-Cyrl", "ru", "en"];
  for (const locale of locales) {
    if (pathname.startsWith(`/${locale}`)) {
      return pathname.slice(locale.length + 1) || "/";
    }
  }
  return pathname;
}

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const cleanPath = stripLocale(pathname);
  const hasSession = Boolean(request.cookies.get(AUTH_COOKIE)?.value);

  if (isAlwaysPublic(pathname)) {
    return intlMiddleware(request);
  }

  if (!hasSession && !isAuthPage(cleanPath)) {
    const locales = ["uz-Latn", "uz-Cyrl", "ru", "en"];
    const first = pathname.split("/")[1] ?? "";
    const locale = locales.includes(first) ? first : "uz-Latn";
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    return NextResponse.redirect(url);
  }

  if (hasSession && isAuthPage(cleanPath)) {
    const locales = ["uz-Latn", "uz-Cyrl", "ru", "en"];
    const first = pathname.split("/")[1] ?? "";
    const locale = locales.includes(first) ? first : "uz-Latn";
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/home`;
    return NextResponse.redirect(url);
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|storage|manifest).*)"],
};
