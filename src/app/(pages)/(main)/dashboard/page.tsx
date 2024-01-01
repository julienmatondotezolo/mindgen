import React from "react";

import { HeroProfile, Navigation } from "@/components/dashboard";

export default function Dashboard() {
  return (
    <>
      <Navigation />
      <div className="flex justify-center mt-32">
        <section className="max-w-7xl w-[90%]">
          <HeroProfile />
        </section>
      </div>
    </>
  );
}
