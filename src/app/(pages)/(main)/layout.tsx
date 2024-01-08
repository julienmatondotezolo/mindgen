"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import React, { JSX } from "react";

export default function Layout({ children }: { children: React.ReactNode }): JSX.Element {
  const { data: session } = useSession();

  const router = useRouter();

  // console.log("session MAIN:", session);

  if (session?.session == null) {
    router.replace("/auth/login");
  }

  return <>{children}</>;
}
