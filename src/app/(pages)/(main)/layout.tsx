"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import React, { JSX, useEffect } from "react";

export default function Layout({ children }: { children: React.ReactNode }): JSX.Element {
  const { data: session } = useSession();

  const router = useRouter();

  useEffect(() => {
    if (session?.authenticated == false) {
      router.replace("/auth/login");
    }
  }, [session]);

  return <>{children}</>;
}
