// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import createMiddleware from "next-intl/middleware";

import { localePrefix, locales } from "./navigation";

// Create the internationalization middleware
const intlMiddleware = createMiddleware({
  defaultLocale: "en",
  localePrefix,
  locales,
});

export default async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Define protected paths
  const protectedPaths = ["/dashboard", "/board", "/profile"];

  // Handle internationalized paths by removing the locale prefix
  const sanitizedPath = pathname.replace(/^\/(en|fr|nl)\//, "/");

  // Check if the current path is protected
  const isPathProtected = protectedPaths.some((path) => sanitizedPath.startsWith(path));

  if (isPathProtected) {
    const token = await getToken({ req });

    if (!token) {
      // Extract the current locale from the pathname
      const localeMatch = pathname.match(/^\/(en|fr|nl)/);
      const currentLocale = localeMatch ? localeMatch[0] : "/en";

      // Create redirect URL with proper locale prefix
      const url = new URL(`${currentLocale}/auth/login`, req.url);

      url.searchParams.set("callbackUrl", pathname);

      return NextResponse.redirect(url);
    }
  }

  // Handle internationalization for all routes
  return intlMiddleware(req);
}

export const config = {
  // Match all routes that need internationalization or protection
  matcher: ["/", "/(en|fr|nl)/:path*", "/dashboard/:path*", "/board/:path*", "/profile/:path*"],
};
