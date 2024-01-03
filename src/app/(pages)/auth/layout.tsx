"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import React, { JSX, useEffect } from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }): JSX.Element {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session]);

  return (
    <main className="flex-grow mx-auto">
      <div className="w-full">{children}</div>
    </main>
  );
}
