import React from "react";
import { useRecoilValue } from "recoil";

import { promptValueState } from "@/app/recoil";
import { SkeletonAnswerText } from "@/components/gpt";

import { Skeleton } from "../ui/skeleton";

function AnswerText() {
  const promptValue = useRecoilValue(promptValueState);

  return (
    <div className="flex flex-row flex-wrap justify-center m-auto w-[90%] md:w-2/4 mt-36">
      {promptValue ? (
        <h1 className="text-lg font-bold">{promptValue}</h1>
      ) : (
        <Skeleton className="h-6 w-96 bg-grey-blue" />
      )}
      <SkeletonAnswerText />
    </div>
  );
}

export { AnswerText };
