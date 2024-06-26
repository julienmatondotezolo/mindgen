"use client";
import React from "react";
import { useRecoilState } from "recoil";

import { BackDropGradient, MindmapDialog, ToastAction, useToast } from "@/components";
import { HeroProfile, MindGenTemplates, Navigation, RecentMindMap } from "@/components/dashboard";
import { modalState } from "@/state";

export default function Dashboard() {
  const [isOpen, setIsOpen] = useRecoilState(modalState);
  const { toast } = useToast();

  // Function to trigger a toast notification
  const triggerToast = () => {
    toast({
      title: "Hello, World!",
      description: "This is a test toast notification.",
      action: <ToastAction altText="Try again">Open mindmap</ToastAction>,
    });
  };

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
      <button className="fixed left-5 bottom-5" onClick={triggerToast}>
        Click me
      </button>
      <MindmapDialog open={isOpen} setIsOpen={setIsOpen} update={false} />
    </>
  );
}
