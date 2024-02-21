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
  matcher: ["/", "/(fr|nl)/:path*", "/dashboard", "/board/:id"],
};

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const protectedPaths = ["/dashboard", "/board/:id"]; // Define your protected paths here

  const isPathProtected = protectedPaths.some((protectedPath) => {
    // Handle internationalized paths by removing the locale prefix before checking
    const sanitizedPath = pathname.replace(/^\/(en|fr|nl)\//, "/");

    if (protectedPath.includes(":")) {
      // For dynamic paths like /board/:id, use a regex test instead of startsWith
      return new RegExp(`^${protectedPath.replace(":id", "\\d+")}`).test(sanitizedPath);
    } else {
      return sanitizedPath.startsWith(protectedPath);
    }
  });

  const res = NextResponse.next();

  if (isPathProtected) {
    const token = await getToken({ req });

    if (!token) {
      const url = new URL(`/auth/login`, req.url);

      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
  }

  return res;
}
