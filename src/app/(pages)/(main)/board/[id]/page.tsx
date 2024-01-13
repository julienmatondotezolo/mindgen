"use client";

import Image from "next/image";
import { useEffect } from "react";
import { useQuery } from "react-query";
import { useRecoilState, useRecoilValue } from "recoil";

import { getMindmapById } from "@/_services";
import { MindMapDetailsProps } from "@/_types";
import arrowIcon from "@/assets/icons/arrow.svg";
import { Spinner } from "@/components";
import { Answers, PromptTextInput } from "@/components/gpt";
import { NavLeft, NavRight, ToolBar } from "@/components/header";
import { Mindmap } from "@/components/mindmap/";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { promptResultState, promptValueState, qaState } from "@/recoil";
import { findCollaboratorId } from "@/utils";
import { scrollToBottom, scrollToTop } from "@/utils/scroll";

export default function Board({ params }: { params: { id: string } }) {
  const size = 20;
  const [promptResult, setPromptResult] = useRecoilState(promptResultState);
  const promptValue = useRecoilValue(promptValueState);
  const [qa, setQa] = useRecoilState(qaState);

  useEffect(() => {
    if (promptResult) {
      scrollToBottom();
    }
  }, [promptResult]);

  function handleScrollTop() {
    if (promptResult) {
      scrollToTop();
      setPromptResult(false);
    } else {
      scrollToBottom();
      setPromptResult(true);
    }
  }

  const getUserMindmapById = () => getMindmapById(params.id);

  const { isLoading, data: userMindmapDetails } = useQuery<MindMapDetailsProps>(
    ["mindmap", params.id],
    getUserMindmapById,
  );

  useEffect(() => {
    if (userMindmapDetails) {
      setQa([]);
      const newQaItems = userMindmapDetails.messages.map((mindMapQA) => ({
        text: mindMapQA.request,
        message: mindMapQA.response,
      }));

      setQa((oldQa) => [...oldQa, ...newQaItems]);
    }
  }, [userMindmapDetails]);

  const userCollaboratorID = findCollaboratorId(userMindmapDetails?.creatorId, userMindmapDetails?.collaborators);

  return (
    <main className="flex justify-between w-screen h-screen scroll-smooth">
      <div className="flex justify-between w-[96%] fixed left-2/4 -translate-x-2/4 top-5 z-50">
        <NavLeft mindMapName={userMindmapDetails?.id} />
        <ToolBar />
        <NavRight />
      </div>

      <div className="w-[80%] md:w-1/3 fixed left-2/4 -translate-x-2/4 bottom-6 z-10">
        <PromptTextInput collaboratorId={userCollaboratorID} />
      </div>

      <div
        className={`fixed right-5 bottom-6 z-10 ${
          promptValue || qa.length > 0 ? "opacity-100 ease-in duration-500" : "opacity-0 ease-out duration-500"
        }`}
      >
        <Button onClick={handleScrollTop} className="absolute bottom-2 right-2" size="icon">
          <Image
            className={`${!promptResult ? "rotate-180" : "rotate-0"} transition-all duration-500`}
            src={arrowIcon}
            height={size}
            width={size}
            alt="Stars icon"
          />
        </Button>
      </div>

      <div className="w-full">
        <div className="relative w-full h-full">
          {isLoading ? (
            <div className="relative flex w-full h-full">
              <Skeleton className="bg-grey-blue w-full h-full" />
              <Spinner
                className="absolute inset-0 flex items-center justify-center"
                loadingText={"Preparing your mindmap"}
              />
            </div>
          ) : (
            <Mindmap userMindmapDetails={userMindmapDetails} />
          )}
        </div>
        {promptValue || qa.length > 0 ? (
          <div className="relative w-full h-full flex flex-row justify-center">
            <Answers />
          </div>
        ) : (
          ""
        )}
      </div>
    </main>
  );
}
