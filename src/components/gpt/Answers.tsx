import Image from "next/image";
import React from "react";
import { useRecoilValue } from "recoil";

import answerIcon from "@/assets/icons/answer.svg";
import { AnswerMessages, SkeletonAnswerText } from "@/components/gpt";
import { promptValueState, qaState } from "@/recoil";

function Answers() {
  const qa = useRecoilValue(qaState);
  const size = 15;

  return (
    <div className="flex flex-row flex-wrap m-auto w-[90%] md:w-2/4 mt-36 pb-36">
      {/* {promptValue ? (
        <h1 className="text-lg font-bold mb-2">{promptValue}</h1>
      ) : (
        <Skeleton className="h-6 w-96 bg-grey-blue" />
      )} */}
      <div className="w-full">
        {qa.map((qaItem, index) => (
          <div key={index} className="border-t-2 pt-8 mb-8 space-y-2">
            <h3 className="text-2xl font-bold mb-6">{qaItem.text}</h3>

            <article className="flex mb-2 text-primary-color">
              <Image className="mr-2" src={answerIcon} height={size} width={size} alt="answer icon" />
              <p className="font-semibold">Answer | Mindgen</p>
            </article>

            {qaItem.message ? (
              <p className="opacity-100 ease-in duration-500">{qaItem.message}</p>
            ) : (
              <SkeletonAnswerText />
            )}
          </div>
        ))}
        {/* <AnswerMessages /> */}
      </div>
    </div>
  );
}

export { Answers };
