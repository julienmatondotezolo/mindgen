"use client";

import { useTranslations } from "next-intl";
import React from "react";

import { BackDropGradient } from "@/components";
import { Navigation } from "@/components/dashboard";
import { Plans } from "@/components/plans";

// Define the type for the Plan component prop

// bg-emerald-500

export default function Pricing() {
  const pricingPageText = useTranslations("Pricing");

  return (
    <div className="relative">
      <BackDropGradient />
      <Navigation />
      <div className="flex flex-wrap justify-center py-32">
        <article className="w-full space-y-3 text-center">
          <h1 className="text-5xl text-primary-color font-bold">{pricingPageText("hero")}</h1>
          <h1 className="text-2xl font-medium dark:text-white">{pricingPageText("heroExplanation")}</h1>
        </article>

        <div className="grid sm:grid-cols-3 grid-cols-1 gap-12 mt-20">
          <Plans title={pricingPageText("freePlan")} price={0} />
          <Plans title={pricingPageText("payAsYouGoPlan")} price={5} />
          <Plans title={pricingPageText("EnterprisePlan")} price={10} />
        </div>
      </div>
    </div>
  );
}
