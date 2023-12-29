"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import React, { JSX } from "react";

export default function MainPagesLayout({ children }: { children: React.ReactNode }): JSX.Element {
  const { data: session } = useSession();
  const router = useRouter();

  if (session == undefined) {
    router.push("/auth/login");
  }
  console.log("session:", session);

  return <>{children}</>;
}
