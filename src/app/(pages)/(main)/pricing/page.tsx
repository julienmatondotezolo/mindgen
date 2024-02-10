"use client";

import React from "react";

import { Navigation } from "@/components/dashboard";

// Define the type for the Plan component props
interface PlanProps {
  title: string;
}

// Define the Plan component
const Plan: React.FC<PlanProps> = ({ title }) => (
  <div className="bg-gray-200 bg-opacity-40 p-8 rounded-xl">
    <h2 className="text-lg font-semibold">{title}</h2>
    <p className="mt-4">Basic features for free</p>
    <button className="mt-6 bg-primary-color text-white px-4 py-2 rounded-md">Get Started</button>
  </div>
);

// bg-emerald-500

export default function Pricing() {
  return (
    <div className="relative">
      <div className="absolute left-1/2 top-0 -z-10 -translate-x-1/2 h-[200px] w-4/5 md:h-[400px] rounded-[100%] bg-primary-color blur-[90px] pointer-events-none opacity-10"></div>
      <Navigation />
      <div className="flex flex-wrap justify-center mt-36">
        <article className="space-y-3 text-center">
          <h1 className="text-5xl text-primary-color font-bold">Pricing</h1>
          <h1 className="text-2xl font-medium">Pay only for what you use with per-request pricing.</h1>
        </article>

        <div className="grid sm:grid-cols-3 grid-cols-1 gap-6 mt-20">
          <Plan title="Free" />
          <Plan title="Pay as you go" />
          <Plan title="Enterprise" />
        </div>
      </div>
    </div>
  );
}
