"use client";
import React from "react";
import { useRecoilState } from "recoil";

import { BackDropGradient, MindmapDialog } from "@/components";
import { HeroProfile, MindGenTemplates, Navigation, RecentMindMap } from "@/components/dashboard";
import { modalState } from "@/state";

export default function Dashboard() {
  const [isOpen, setIsOpen] = useRecoilState(modalState);

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
      <MindmapDialog open={isOpen} setIsOpen={setIsOpen} update={false} />
    </>
  );
}
