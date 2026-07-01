import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { NO_HEADER_ROUTES, PUBLIC_ROUTES } from "./lib/constant";
import { locales, defaultLocale } from "@/lib/i18n";

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // --- Skip for internal/static files ---
  const ignorePaths = [
    '/favicon.ico',
    /^\/_next\//,
    /^\/api\//,
    /\.(.*)$/, // static files
  ];
  const shouldIgnore = ignorePaths.some(pattern =>
    pattern instanceof RegExp ? pattern.test(pathname) : pathname === pattern
  );
  if (shouldIgnore) return NextResponse.next();

  // --- Locale Handling ---
  // Extract first segment as locale
  const pathLocale = pathname.split("/")[1];
  const hasLocale = locales.includes(pathLocale as typeof locales[number]);

  // Try to get language from cookie
  const cookieLocale = request.cookies.get("language")?.value;
  const validCookieLocale = locales.includes(cookieLocale as typeof locales[number]) ? cookieLocale : undefined;

  // --- Locale Decision Logic ---
  if (!hasLocale) {
    // Priority: cookie → default (always Indonesian for new visitors)
    const targetLocale = validCookieLocale || defaultLocale;
    const response = NextResponse.redirect(
      new URL(`/${targetLocale}${pathname}${search}`, request.url)
    );
    // Set cookie for guest, so next reload remains consistent
    response.cookies.set("language", targetLocale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: "lax",
    });
    return response;
  }

  // --- Helper: sync language cookie on response ---
  const needsCookieSync = cookieLocale !== pathLocale;
  function syncLanguageCookie(response: NextResponse) {
    if (needsCookieSync) {
      response.cookies.set("language", pathLocale, {
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        sameSite: "lax",
      });
    }
    return response;
  }

  // --- Auth Handling (JWT token from cookies) ---
  const token = request.cookies.get("token")?.value;

  // Public routes (accessible without authentication)
  const publicPaths = PUBLIC_ROUTES.map(route => `/${pathLocale}${route}`);

  // Protected routes (require valid token)
  const privatePatterns = [
    new RegExp(`^/${pathLocale}/orders(\\/.*)?$`),
    new RegExp(`^/${pathLocale}/profile$`),
  ];

  if (token) {
    const payload = await verifyToken(token);

    if (!payload) {
      // Token invalid: clear cookie + redirect to login if not public
      const response = publicPaths.includes(pathname)
        ? NextResponse.next()
        : NextResponse.redirect(new URL(`/${pathLocale}/login`, request.url));

      response.cookies.set("token", "", {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        expires: new Date(0),
      });

      return syncLanguageCookie(response);
    }

    // If user is logged in and accesses login/register, redirect to home
    if (NO_HEADER_ROUTES.includes(pathname.replace(`/${pathLocale}`, ""))) {
      return syncLanguageCookie(NextResponse.redirect(new URL(`/${pathLocale}`, request.url)));
    }

    // Valid token and accessing any allowed route
    return syncLanguageCookie(NextResponse.next());
  }

  // No token, trying to access protected page
  const isPrivate = privatePatterns.some(regex => regex.test(pathname));
  if (!token && isPrivate) {
    return syncLanguageCookie(NextResponse.redirect(new URL(`/${pathLocale}/login`, request.url)));
  }

  // No token, accessing public route
  return syncLanguageCookie(NextResponse.next());
}

// --- Matcher config ---
export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
