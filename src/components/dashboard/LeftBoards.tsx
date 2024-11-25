import { Gem, Presentation } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";
import { useRecoilValue } from "recoil";

import { Link } from "@/navigation";
import { boardsLengthState, profilMaxMindmapState } from "@/state";

import { Button } from "../ui";

function LeftBoards() {
  const navigationText = useTranslations("Navigation");
  const maxMindmap = useRecoilValue(profilMaxMindmapState);
  const boardLength = useRecoilValue(boardsLengthState);

  return (
    <div className="w-full flex justify-between px-6 py-4 rounded-2xl bg-[#f3f5f7] dark:bg-slate-500 dark:bg-opacity-20">
      <article className="flex items-center space-x-2">
        <Presentation size={15} />
        <p className="font-bold text-sm">{`${maxMindmap - boardLength} boards left.`}</p>
        <p className="text-sm">Upgrade to get unlimited access</p>
      </article>
      <Link href={`/pricing`}>
        <Button variant={"outline"}>
          <Gem className="mr-4" size={14} />
          {navigationText("upgradeButton")}
        </Button>
      </Link>
    </div>
  );
}

export { LeftBoards };
