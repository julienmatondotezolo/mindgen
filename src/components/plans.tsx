import { useTranslations } from "next-intl";
import React, { JSX } from "react";

import { Button } from "./ui/button";

interface PlanProps {
  title: string;
  price: number;
}

function Plans({ title, price }: PlanProps): JSX.Element {
  const pricingPageText = useTranslations("Pricing");

  return (
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
      <Button className="mt-6">{`${pricingPageText("planButton")} ${title}`}</Button>
    </div>
  );
}

export { Plans };
