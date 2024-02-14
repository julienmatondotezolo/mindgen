"use client";

import React from "react";

import { BackDropGradient, Button } from "@/components";
import { Navigation } from "@/components/dashboard";

// Define the type for the Plan component props
interface PlanProps {
  title: string;
  price: number;
}

// Define the Plan component
const Plan: React.FC<PlanProps> = ({ title, price }) => (
  <div className="bg-gray-200 dark:bg-slate-500 dark:bg-opacity-20 bg-opacity-40 py-8 px-16 rounded-xl dark:text-white">
    <p className="text-lg text-primary-color font-semibold">{title}</p>
    <p className="font-bold text-3xl mt-1">€ {price}</p>
    <p className="my-6">Basic features for free</p>
    <div className="border-y-2 dark:border-slate-700 py-6 space-y-4">
      <article>
        <p className=" opacity-50">Max Mindmap per months</p>
        <p className="font-medium">1000</p>
      </article>
    </div>
    <Button className="mt-6">Get Started with {title}</Button>
  </div>
);

// bg-emerald-500

export default function Pricing() {
  return (
    <div className="relative">
      <BackDropGradient />
      <Navigation />
      <div className="flex flex-wrap justify-center py-32">
        <article className="w-full space-y-3 text-center">
          <h1 className="text-5xl text-primary-color font-bold">Pricing</h1>
          <h1 className="text-2xl font-medium dark:text-white">Pay only for what you use with per-request pricing.</h1>
        </article>

        <div className="grid sm:grid-cols-3 grid-cols-1 gap-12 mt-20">
          <Plan title="Free" price={0} />
          <Plan title="Pay as you go" price={5} />
          <Plan title="Enterprise" price={10} />
        </div>
      </div>
    </div>
  );
}