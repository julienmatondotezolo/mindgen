"use client";
import React from "react";
import { useRecoilState } from "recoil";

import { BackDropGradient, MindmapDialog, ToastAction, useToast } from "@/components";
import { HeroProfile, MindGenTemplates, Navigation, OrgSidebar, RecentMindMap } from "@/components/dashboard";
import { OrganizationDialog } from "@/components/ui/organizationDialog";
import { collaborateModalState, modalState, organizationState } from "@/state";

export default function Dashboard() {
  const [isOpen, setIsOpen] = useRecoilState(modalState);
  const [isOrganization, setOrganization] = useRecoilState(organizationState);
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
        <section className="space-y-12 max-w-7xl w-[90%]">
          <HeroProfile />
          <article className="flex justify-between">
            <div className="w-[25%]">
              <OrgSidebar />
            </div>
            <div className="w-full space-y-12">
              <MindGenTemplates />
              <RecentMindMap />
            </div>
          </article>
        </section>
      </div>
      <button className="fixed left-5 bottom-5" onClick={triggerToast}>
        Click me
      </button>
      <MindmapDialog open={isOpen} setIsOpen={setIsOpen} update={false} />
      <OrganizationDialog open={isOrganization} setIsOpen={setOrganization} update={false} />
    </>
  );
}
