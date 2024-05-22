"use client";

import Image from "next/image";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useRecoilState, useRecoilValue } from "recoil";
import { generateUsername } from "unique-username-generator";

import { getMindmapById } from "@/_services";
import { MindMapDetailsProps } from "@/_types";
import arrowIcon from "@/assets/icons/arrow.svg";
import { BackDropGradient, Spinner } from "@/components";
import { Answers, PromptTextInput } from "@/components/gpt";
import { NavLeft, NavRight, ToolBar } from "@/components/header";
import { Mindmap } from "@/components/mindmap/";
import { Button, CollaborateDialog, ImportDialog, ShareDialog, Skeleton, UpgradePlanDialog } from "@/components/ui";
import { useDidUpdateEffect, useSocket } from "@/hooks";
import { Link } from "@/navigation";
import {
  collaborateModalState,
  importModalState,
  promptResultState,
  promptValueState,
  qaState,
  shareModalState,
  upgradePlanModalState,
} from "@/state";
import { checkPermission, refreshPage, uppercaseFirstLetter } from "@/utils";
import { scrollToBottom, scrollToTop } from "@/utils/scroll";

export default function Board({ params }: { params: { id: string } }) {
  const text = useTranslations("Index");
  const [promptResult, setPromptResult] = useRecoilState(promptResultState);
  const [importModal, setImportModal] = useRecoilState(importModalState);
  const [shareModal, setShareModal] = useRecoilState(shareModalState);
  const [collaborateModal, setCollaborateModal] = useRecoilState(collaborateModalState);
  const [upgradePlanModal, setUpgradePlanModal] = useRecoilState(upgradePlanModalState);
  const promptValue = useRecoilValue(promptValueState);
  const [qa, setQa] = useRecoilState(qaState);

  const [collaUsername, setCollaUsername] = useState("");
  const [collaCursorPos, setCollaCursorPos] = useState<any>({});

  const session = useSession();

  const { socketEmit, socketListen, socketOff } = useSocket();

  useDidUpdateEffect(() => {
    const username = session.data?.session?.user.username;

    if (username) {
      setCollaUsername(username);
    } else {
      const usernameFromStorage = sessionStorage.getItem("collaUsername");
      let username = usernameFromStorage ?? generateUsername();

      sessionStorage.setItem("collaUsername", username);

      setCollaUsername(username);
    }
  }, [session]);

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

  // const getUserMindmapById = () => getMindmapById(params.id);

  const getUserMindmapById = async () => {
    const mindmapData = await getMindmapById(params.id);

    return mindmapData;
  };

  const { isLoading, data: userMindmapDetails } = useQuery<MindMapDetailsProps>(
    ["mindmap", params.id],
    getUserMindmapById,
    {
      // refetchOnMount: "always",
      onSuccess: async (data) => {
        if (data.messages) {
          // await joinRoom(data);
          setQa([]);
          const newQaItems = data.messages.map((mindMapQA) => ({
            text: mindMapQA.request,
            message: mindMapQA.response,
          }));

          setQa((prevQa) => [...prevQa, ...newQaItems]);
        }
      },
    },
  );

  const PERMISSIONS = userMindmapDetails?.connectedCollaboratorPermissions;

  async function handleCursorMove(event: { clientX: any; clientY: any }) {
    const cursorPos = { x: event.clientX, y: event.clientY };

    socketEmit("cursor-move", {
      roomId: userMindmapDetails?.id,
      username: collaUsername,
      cursorPos,
    });
  }

  useEffect(() => {
    // Listen for cursor movements
    socketListen("remote-cursor-move", (data) => {
      const { cursorPos, username } = data;

      setCollaUsername(username);
      setCollaCursorPos(cursorPos);
    });

    // Cleanup
    return () => {
      socketOff("cursor-move");
    };
  }, []);

  if (isLoading)
    return (
      <div className="flex w-full h-full fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
        <Skeleton className="bg-primary-opaque dark:bg-gray-700 w-full h-full" />
        <Spinner
          className="absolute inset-0 flex items-center justify-center"
          loadingText={`${text("loading")} mindmap`}
        />
      </div>
    );

  if (userMindmapDetails)
    return (
      <>
        <main onMouseMove={handleCursorMove} className="relative flex justify-between w-screen h-screen scroll-smooth">
          <BackDropGradient />
          <div className="flex justify-between w-[96%] fixed left-2/4 -translate-x-2/4 top-5 z-50">
            <NavLeft userMindmapDetails={userMindmapDetails} />
            {checkPermission(PERMISSIONS, "UPDATE") && <ToolBar userMindmapDetails={userMindmapDetails} />}
            <NavRight userMindmapDetails={userMindmapDetails} />
          </div>

          {session.data?.session && (
            <div className="sm:w-[40%] w-[90%] fixed left-2/4 -translate-x-2/4 bottom-6 z-10">
              {userMindmapDetails ? (
                <PromptTextInput userMindmapDetails={userMindmapDetails} />
              ) : (
                <Skeleton className="w-full max-h-36 h-12 bg-grey-blue rounded-xl" />
              )}
            </div>
          )}

          <div
            className={`fixed right-5 bottom-6 z-10 ${
              promptValue || qa.length > 0 ? "opacity-100 ease-in duration-500" : "opacity-0 ease-out duration-500"
            }`}
          >
            <Button onClick={handleScrollTop} className="absolute bottom-2 right-2" size="icon">
              <Image
                className={`${!promptResult ? "rotate-180" : "rotate-0"} transition-all duration-500`}
                src={arrowIcon}
                alt="Stars icon"
              />
            </Button>
          </div>

          <div className="w-full">
            <div className="relative w-full h-full">
              {isLoading && collaUsername !== undefined ? (
                <div className="relative flex w-full h-full">
                  <Skeleton className="bg-primary-opaque dark:bg-gray-700 w-full h-full" />
                  <Spinner
                    className="absolute inset-0 flex items-center justify-center"
                    loadingText={"Preparing your mindmap"}
                  />
                </div>
              ) : (
                <Mindmap userMindmapDetails={userMindmapDetails} collaUsername={collaUsername} />
              )}
            </div>
            {qa.length > 0 ? (
              <div className="relative w-full h-full flex flex-row justify-center bg-background">
                <Answers />
              </div>
            ) : (
              ""
            )}
          </div>
        </main>
        <ImportDialog open={importModal} setIsOpen={setImportModal} />
        <ShareDialog open={shareModal} setIsOpen={setShareModal} />
        <CollaborateDialog open={collaborateModal} setIsOpen={setCollaborateModal} mindmapId={params.id} />
        <UpgradePlanDialog open={upgradePlanModal} setIsOpen={setUpgradePlanModal} />
        <div
          style={{ left: collaCursorPos.x, top: collaCursorPos.y }}
          className="fixed bg-[#FF4DC4] px-6 py-2 w-fit max-h-10 rounded-full z-50"
        >
          <p>{uppercaseFirstLetter(collaUsername)}</p>
        </div>
        ;
      </>
    );

  if (!isLoading)
    return (
      <>
        <main className="relative flex justify-between w-screen h-screen">
          <BackDropGradient />
        </main>
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 sm:w-11/12 md:w-4/12 bg-white border-2 p-6 space-y-8 rounded-xl shadow-lg backdrop-filter backdrop-blur-lg dark:bg-slate-900 dark:bg-opacity-70 dark:shadow-slate-900 dark:border-slate-800">
          <article className="flex flex-wrap justify-between w-full">
            <p className="font-bold text-xl">Oups something went wrong !</p>
          </article>
          <div className="w-full mt-4 space-y-6">
            <p>
              It looks like you are not allowed to access this mindmap. Ask the owner to put the mindmap in public our
              invite you.
            </p>
            <section className="space-x-4">
              <Link href={`/dashboard`}>
                <Button>Go to dashboard</Button>
              </Link>
              <button className="text-xs underline" onClick={refreshPage}>
                Retry
              </button>
            </section>
          </div>
        </div>
      </>
    );
}
