import "@/assets/styles/globals.css";

import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import Script from "next/script";
import React from "react";
import { Monitoring } from "react-scan/monitoring/next";

const dmSans = DM_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MindGen - Generate * with mindmap",
  description: "Generated everything with a mindmap",
  icons: {
    icon: "/favicon.ico",
  },
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
      <head>
        <Script src="https://unpkg.com/react-scan/dist/install-hook.global.js" strategy="beforeInteractive" />
      </head>
      <body className={`${dmSans.className}`}>
        <Monitoring
          apiKey="0ES5BMWjwh8Niaga-SnD-Q9DhNd2dr77" // Safe to expose publically
          url="https://monitoring.react-scan.com/api/v1/ingest"
          commit={process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA} // optional but recommended
          branch={process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF} // optional but recommended
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
