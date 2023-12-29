import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";

export async function GET(): Promise<NextResponse> {
  const session = await getServerSession(authOptions);

  return NextResponse.json({
    authenticated: !!session,
    session,
  });
}
