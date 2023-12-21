"use client";

import Image from "next/image";
import { useEffect } from "react";
import { useRecoilState } from "recoil";

import arrowIcon from "@/assets/icons/arrow.svg";
import { AnswerText, PromptTextInput } from "@/components/gpt";
import { NavLeft, NavRight, ToolBar } from "@/components/header";
import Mindmap from "@/components/mindmap/MindMap";
import { Button } from "@/components/ui/button";
import { promptResultState } from "@/recoil";
import { scrollToBottom, scrollToTop } from "@/utils/scroll";

export default function Home() {
  const size = 20;
  const [promptResult, setPromptResult] = useRecoilState(promptResultState);

  useEffect(() => {
    if (promptResult) {
      scrollToBottom();
    } else {
      scrollToTop();
    }
  }, [promptResult]);

  function handleScrollTop() {
    scrollToTop();
    setPromptResult(false);
  }

  return (
    <main className="flex justify-between w-screen h-screen scroll-smooth">
      <div className="flex justify-between w-[96%] fixed left-2/4 -translate-x-2/4 top-5 z-10">
        <NavLeft />
        <ToolBar />
        <NavRight />
      </div>

      <div className="w-[80%] md:w-1/3 fixed left-2/4 -translate-x-2/4 bottom-6 z-10">
        <PromptTextInput />
      </div>

      <div
        className={`fixed right-5 bottom-6 z-10 ${
          promptResult ? "opacity-100 ease-in duration-500" : "opacity-0 ease-out duration-500"
        }`}
      >
        <Button onClick={handleScrollTop} className="absolute bottom-2 right-2" size="icon">
          <Image src={arrowIcon} height={size} width={size} alt="Stars icon" />
        </Button>
      </div>

      <div className="w-full">
        <div className="relative w-full h-full">
          <Mindmap />
        </div>
        <div className="relative w-full h-full flex flex-row justify-center">
          <AnswerText />
        </div>
      </div>
    </main>
  );
}
