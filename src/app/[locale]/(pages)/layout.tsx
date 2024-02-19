"use client";

import React from "react";

import Providers from "../providers";

export default function PagesLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return <Providers locale={locale}>{children}</Providers>;
}
