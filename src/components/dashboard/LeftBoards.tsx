import { Presentation } from "lucide-react";
import React from "react";
import { useRecoilValue } from "recoil";

import { boardsLengthState, profilMaxMindmapState } from "@/state";

function LeftBoards() {
  const maxMindmap = useRecoilValue(profilMaxMindmapState);
  const boardLength = useRecoilValue(boardsLengthState);
  const leftBoards = maxMindmap - boardLength;

  return (
    <div className="w-full flex justify-between px-6 py-4 rounded-2xl bg-[#f3f5f7] dark:bg-slate-500 dark:bg-opacity-20">
      <article className="flex items-center space-x-2">
        <Presentation size={15} />
        <p className="font-bold text-sm">{`${leftBoards} boards left.`}</p>
        {/*     <p className="text-sm">Upgrade to get unlimited access</p> */}
      </article>
      {/*       <Link href={`/#pricing`}>
        <Button variant={"outline"}>
          <Gem className="mr-4" size={14} />
          {navigationText("upgradeButton")}
        </Button>
      </Link> */}
    </div>
  );
}

export { LeftBoards };
