"use client";

import React, { JSX } from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <main className="flex-grow mx-auto">
      <div className="w-full">{children}</div>
    </main>
  );
}
