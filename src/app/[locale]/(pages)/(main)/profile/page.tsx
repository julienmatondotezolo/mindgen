"use client";
import React from "react";

import { BackDropGradient, Navigation } from "@/components";

export default function Profile() {
  return (
    <>
      <Navigation />
      <div className="relative flex justify-center pt-32">
        <BackDropGradient />
        <h1>Profile page</h1>
      </div>
    </>
  );
}
