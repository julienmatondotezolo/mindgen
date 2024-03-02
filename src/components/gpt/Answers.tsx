import Image from "next/image";
import { useTranslations } from "next-intl";
import React from "react";
import { useRecoilValue } from "recoil";

import answerIcon from "@/assets/icons/answer.svg";
import { SkeletonAnswerText } from "@/components/gpt";
import { qaState } from "@/state";

function Answers() {
  const chatText = useTranslations("Chat");
  const qa = useRecoilValue(qaState);
  const size = 15;

  return (
    <div className="flex flex-row flex-wrap m-auto w-[90%] md:w-2/4 mt-36 pb-36 dark:text-white">
      <div className="w-full">
        {qa.map((qaItem, index) => (
          <div key={index} className="border-t-2 dark:border-slate-800 pt-8 mb-8 space-y-2">
            <h3 className="text-2xl font-bold mb-6 dark:text-white">{qaItem.text}</h3>

            <article className="flex mb-2 text-primary-color">
              <Image className="mr-2" src={answerIcon} height={size} width={size} alt="answer icon" />
              <p className="font-semibold">{chatText("answer")} | Mindgen</p>
            </article>

            {qaItem.message ? qaItem.message : <SkeletonAnswerText />}
          </div>
        ))}
      </div>
    </div>
  );
}

export { Answers };
