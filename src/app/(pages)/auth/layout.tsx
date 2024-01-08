"use client";

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import React, { JSX } from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }): JSX.Element {
  const { data: session } = useSession();
  const router = useRouter();

  // console.log("session AUTH:", session);

  if (session?.session !== null) {
    router.push("/dashboard");
  }

  return (
    <main className="flex-grow mx-auto">
      <div className="w-full">{children}</div>
    </main>
  );
}
