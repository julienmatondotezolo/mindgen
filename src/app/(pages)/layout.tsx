"use client";

import React, { JSX } from "react";

import Providers from "@/app/providers";

export default function RootLayout({ children }: { children: React.ReactNode }): JSX.Element {
  return <Providers>{children}</Providers>;
}
