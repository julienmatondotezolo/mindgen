"use client";

import React from "react";

import Providers from "@/app/providers";

export default function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return <Providers locale={locale}>{children}</Providers>;
}
