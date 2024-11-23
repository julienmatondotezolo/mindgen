import "../../assets/styles/globals.css";

import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import React from "react";

const dmSans = DM_Sans({ subsets: ["latin"] });

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
      <body className={`${dmSans.className}`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
