"use client";
import React from "react";

import { HeroProfile, MindGenTemplates, Navigation, RecentMindMap } from "@/components/dashboard";

export default function Dashboard() {
  return (
    <>
      <Navigation />
      <div className="flex justify-center pt-32">
        <section className="max-w-7xl w-[90%] space-y-12">
          <HeroProfile />
          <MindGenTemplates />
          <RecentMindMap />
        </section>
      </div>
    </>
  );
}
