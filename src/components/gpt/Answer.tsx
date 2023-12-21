import React, { Suspense } from "react";
import { useRecoilValue } from "recoil";

import { Messages, SkeletonAnswerText } from "@/components/gpt";
import { promptValueState } from "@/recoil";

import { Skeleton } from "../ui/skeleton";

function AnswerText() {
  const promptValue = useRecoilValue(promptValueState);

  return (
    <div className="flex flex-row flex-wrap m-auto w-[90%] md:w-2/4 mt-36">
      {promptValue ? (
        <h1 className="text-lg font-bold mb-2">{promptValue}</h1>
      ) : (
        <Skeleton className="h-6 w-96 bg-grey-blue" />
      )}
      <div className="w-full">
        <Suspense fallback={<SkeletonAnswerText />}>
          <Messages />
        </Suspense>
      </div>
    </div>
  );
}

export { AnswerText };
