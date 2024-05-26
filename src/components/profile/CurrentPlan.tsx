import { capitalize } from "lodash";
import Image from "next/image";
import { useTranslations } from "next-intl";
import React from "react";
import { useQuery } from "react-query";

import { fetchProfile } from "@/_services";
import { ProfileProps } from "@/_types";
import diamondsIcon from "@/assets/icons/diamonds.svg";
import { Link } from "@/navigation";

import { Button, Progress } from "..";

const fetchUserProfile = () => fetchProfile();

function CurrentPlan() {
  const navigationText = useTranslations("Navigation");
  const { data: userProfile } = useQuery<ProfileProps>("userProfile", fetchUserProfile);

  function calculatePercentageUsed(totalCredits: number, usedCredits: number) {
    const percentageUsed = (usedCredits / totalCredits) * 100;

    return parseFloat(percentageUsed.toFixed(2));
  }

  const usedCredits = userProfile?.usedCredits ?? 0;
  const MAX_CREDITS = userProfile?.subscriptionDetails.MAX_CREDITS ?? 0;

  const percentageUsed = calculatePercentageUsed(MAX_CREDITS, usedCredits);

  return (
    <div className="w-full !mt-12 p-4 bg-[#f3f5f7] dark:bg-slate-500 dark:bg-opacity-20 rounded-2xl space-y-4">
      <p className="font-bold">Manage plan</p>
      <p className="text-sm">
        {capitalize(userProfile?.plan.toLowerCase())}: <span className="font-bold">{percentageUsed}%</span> used
      </p>
      <section className="space-y-2">
        <Progress value={percentageUsed} />
        <p className="text-[12px] text-grey dark:text-grey-blue">
          <span className="font-bold">{userProfile?.usedCredits}</span> credits used out of{" "}
          <span className="font-bold">{userProfile?.subscriptionDetails.MAX_CREDITS}</span> credits
        </p>
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
