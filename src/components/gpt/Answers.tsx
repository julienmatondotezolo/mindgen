import Image from "next/image";
import React from "react";
import { useRecoilValue } from "recoil";

import answerIcon from "@/assets/icons/answer.svg";
import { SkeletonAnswerText } from "@/components/gpt";
import { qaState } from "@/recoil";

function Answers() {
  const qa = useRecoilValue(qaState);
  const size = 15;

  // Separate function to render text content
  const renderTextContent = (text: string) => {
    if (text.includes("-")) {
      return (
        <ul>
          {text.split("-").map((item, index) => (
            <li className="ml-2 list-disc" key={index}>
              {item}
            </li>
          ))}
        </ul>
      );
    } else {
      return <p className="opacity-100 ease-in duration-500">{text}</p>;
    }
  };

  return (
    <div className="flex flex-row flex-wrap m-auto w-[90%] md:w-2/4 mt-36 pb-36">
      <div className="w-full">
        {qa.map((qaItem, index) => (
          <div key={index} className="border-t-2 pt-8 mb-8 space-y-2">
            <h3 className="text-2xl font-bold mb-6">{qaItem.text}</h3>

            <article className="flex mb-2 text-primary-color">
              <Image className="mr-2" src={answerIcon} height={size} width={size} alt="answer icon" />
              <p className="font-semibold">Answer | Mindgen</p>
            </article>

            {qaItem.message ? renderTextContent(qaItem.message) : <SkeletonAnswerText />}
          </div>
        ))}
      </div>
    </div>
  );
}

export { Answers };
