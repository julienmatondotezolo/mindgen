// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const protectedPaths = ["/dashboard", /\/board\/\d+/]; // Define your protected paths here

  const isPathProtected = protectedPaths.some((path: string | RegExp) => {
    if (typeof path === "string") {
      return pathname.startsWith(path);
    } else {
      return path.test(pathname);
    }
  });

  const res = NextResponse.next();

  // try {
  //   const apiRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/ping`);

  //   // If the request fails, redirect the user to /auth/login
  //   if (!apiRes.ok) throw new Error("Cannot connect to API");
  // } catch (error) {
  //   console.error(error);
  //   return NextResponse.redirect(`${process.env.NEXT_PUBLIC_URL}/auth/login`);
  // }

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
