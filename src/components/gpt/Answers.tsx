import React from "react";
import { useRecoilValue } from "recoil";

import { AnswerMessages, SkeletonAnswerText } from "@/components/gpt";
import { promptValueState, qaState } from "@/recoil";

function Answers() {
  const qa = useRecoilValue(qaState);

  return (
    <div className="flex flex-row flex-wrap m-auto w-[90%] md:w-2/4 mt-36 pb-36">
      {/* {promptValue ? (
        <h1 className="text-lg font-bold mb-2">{promptValue}</h1>
      ) : (
        <Skeleton className="h-6 w-96 bg-grey-blue" />
      )} */}
      <div className="w-full">
        {qa.map((qaItem, index) => (
          <div key={index} className="border-t-2 pt-4 mb-8">
            <h3 className="text-xl font-bold mb-2">{qaItem.text}</h3>
            {qaItem.message ? <p>{qaItem.message}</p> : <SkeletonAnswerText />}
          </div>
        ))}
        {/* <AnswerMessages /> */}
      </div>
    </div>
  );
}

export { Answers };
