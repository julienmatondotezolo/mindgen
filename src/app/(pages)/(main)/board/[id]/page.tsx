"use client";

import { Progress } from "@radix-ui/react-progress";
import Image from "next/image";
import { useEffect } from "react";
import { useQuery } from "react-query";
import { useRecoilState, useRecoilValue } from "recoil";

import { getMindmapById } from "@/_services";
import { MindMapDetailsProps } from "@/_types";
import arrowIcon from "@/assets/icons/arrow.svg";
import { Answers, PromptTextInput } from "@/components/gpt";
import { NavLeft, NavRight, ToolBar } from "@/components/header";
import { Mindmap } from "@/components/mindmap/";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { promptResultState, promptValueState } from "@/recoil";
import { findCollaboratorId } from "@/utils";
import { scrollToBottom, scrollToTop } from "@/utils/scroll";

export default function Board({ params }: { params: { id: string } }) {
  const size = 20;
  const [promptResult, setPromptResult] = useRecoilState(promptResultState);
  const promptValue = useRecoilValue(promptValueState);

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
          promptValue ? "opacity-100 ease-in duration-500" : "opacity-0 ease-out duration-500"
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
              <li className="absolute inset-0 flex items-center justify-center">
                <div role="status">
                  <svg
                    aria-hidden="true"
                    className="w-6 h-6 me-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                    viewBox="0 0 100 101"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                      fill="currentColor"
                    />
                    <path
                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                      fill="currentFill"
                    />
                  </svg>
                  <span className="sr-only">Loading...</span>
                </div>
                Preparing your mindmap:
              </li>
            </div>
          ) : (
            <Mindmap userMindmapDetails={userMindmapDetails} />
          )}
        </div>
        {promptValue ? (
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
