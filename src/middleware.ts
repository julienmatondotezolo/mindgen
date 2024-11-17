// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import createMiddleware from "next-intl/middleware";

import { localePrefix, locales } from "./navigation";

export default createMiddleware({
  defaultLocale: "en",
  localePrefix,
  locales,
});

export const config = {
  // Match only internationalized pathnames and the protected paths
  matcher: ["/", "/(en|fr|nl)/:path*", "/dashboard", "/board", "/profile"],
};

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  // Handle internationalized paths by removing the locale prefix before checking
  const sanitizedPath = pathname.replace(/^\/(en|fr|nl)\//, "/");
  // Define your protected paths here
  const protectedPaths = ["/dashboard", "/board", "/profile"];

  const isPathProtected = protectedPaths.some((protectedPath) => sanitizedPath.startsWith(protectedPath));

  const res = NextResponse.next();

  if (isPathProtected) {
    const token = await getToken({ req });

    if (!token) {
      // Extract the current locale from the pathname
      const localeMatch = pathname.match(/^\/(en|fr|nl)/);
      // Default to 'en' if no locale is found
      const currentLocale = localeMatch ? localeMatch[0] : "/en";
      const url = new URL(`${currentLocale}/auth/login`, req.url);

      url.searchParams.set("callbackUrl", sanitizedPath);
      return NextResponse.redirect(url);
    }
  }

  return res;
}
