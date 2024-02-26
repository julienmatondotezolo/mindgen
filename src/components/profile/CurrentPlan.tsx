import Image from "next/image";
import { useTranslations } from "next-intl";
import React from "react";

import diamondsIcon from "@/assets/icons/diamonds.svg";
import { Link } from "@/navigation";

import { Button, Progress } from "..";

function CurrentPlan() {
  const navigationText = useTranslations("Navigation");

  return (
    <div className="w-full !mt-12 p-4 bg-[#f3f5f7] dark:bg-slate-500 dark:bg-opacity-20 rounded-2xl space-y-4">
      <p className="font-bold">Manage plan</p>
      <p className="text-sm">Free plan</p>
      <section className="space-y-2">
        <Progress value={25} />
        <p className="text-sm text-grey dark:text-grey-blue">0.01 GB used out of 15 GB</p>
      </section>
      <Link href={`/pricing`}>
        <Button className="mt-4 w-full">
          <Image className="mr-2" src={diamondsIcon} alt="Diamonds icon" />
          {navigationText("upgradeButton")}
        </Button>
      </Link>
    </div>
  );
}

export { CurrentPlan };
