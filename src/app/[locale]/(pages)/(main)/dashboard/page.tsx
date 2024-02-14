"use client";
import { useTranslations } from "next-intl";
import React from "react";

import { BackDropGradient } from "@/components";
import { HeroProfile, MindGenTemplates, Navigation, RecentMindMap } from "@/components/dashboard";

export default function Dashboard() {
  const text = useTranslations("Dashboard");

  console.log("text:", text("hero"));

  return (
    <>
      <Navigation />
      <div className="relative flex justify-center pt-32">
        <BackDropGradient />
        <section className="max-w-7xl w-[90%] space-y-12">
          <HeroProfile />
          <MindGenTemplates />
          <RecentMindMap />
        </section>
      </div>
    </>
  );
}
