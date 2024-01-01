import React from "react";

import { HeroProfile, Navigation } from "@/components/dashboard";
import { MindGenTemplates } from "@/components/dashboard/MindGenTemplates";

export default function Dashboard() {
  return (
    <>
      <Navigation />
      <div className="flex justify-center mt-32">
        <section className="max-w-7xl w-[90%] space-y-12">
          <HeroProfile />
          <MindGenTemplates />
        </section>
      </div>
    </>
  );
}
