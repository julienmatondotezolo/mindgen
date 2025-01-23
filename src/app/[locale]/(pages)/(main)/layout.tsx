"use client";

import { useSession } from "next-auth/react";
import React, { JSX } from "react";

export default function Layout({ children }: { children: React.ReactNode }): JSX.Element {
  const { data: session } = useSession();

  if (!session) return <></>;

  return <>{children}</>;
}