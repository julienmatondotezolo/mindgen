"use client";

import { useEffect } from "react";
import { useRecoilValue } from "recoil";

import { promptResultState } from "@/app/recoil";
import { AnswerText, PromptTextInput } from "@/components/gpt";
import { NavLeft, NavRight, ToolBar } from "@/components/header";
import Mindmap from "@/components/mindmap/MindMap";
import { scrollToBottom, scrollToTop } from "@/utils/scroll";

export default function Home() {
  const promptResult = useRecoilValue(promptResultState);

  useEffect(() => {
    if (promptResult) {
      scrollToBottom();
    } else {
      scrollToTop();
    }
  }, [promptResult]);

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
