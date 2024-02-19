import "../../assets/styles/globals.css";

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import React from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MindGen - Generate * with mindmap",
  description: "Generated everything with a mindmap",
};

export default function RootLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <html suppressHydrationWarning={true} lang={locale}>
      <body className={`${inter.className}`}>{children}</body>
    </html>
  );
}
