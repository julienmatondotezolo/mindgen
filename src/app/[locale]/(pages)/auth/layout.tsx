"use client";

import React, { JSX } from "react";

export default function AuthLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return (
    <main className="flex">
      <div className="max-w-7xl w-[90%] m-auto">{children}</div>
    </main>
  );
}
