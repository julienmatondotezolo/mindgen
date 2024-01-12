// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const protectedPaths = ["/dashboard", /\/board\/\d+/]; // Define your protected paths here
  // const isPathProtected = protectedPaths?.some((path) => pathname == path);

  const isPathProtected = protectedPaths.some((path: string | RegExp) => {
    if (typeof path === "string") {
      return pathname.startsWith(path);
    } else {
      return path.test(pathname);
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
