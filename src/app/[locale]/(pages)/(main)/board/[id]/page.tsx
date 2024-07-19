/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import Image from "next/image";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useRecoilState, useRecoilValue } from "recoil";
import { generateUsername } from "unique-username-generator";

import { getMindmapById } from "@/_services";
import { CustomSession, MindMapDetailsProps } from "@/_types";
import arrowIcon from "@/assets/icons/arrow.svg";
import { BackDropGradient, Spinner, Whiteboard } from "@/components";
import { Answers, PromptTextInput } from "@/components/gpt";
import { NavLeft, NavRight, ToolBar } from "@/components/header";
import { Canvas, Mindmap } from "@/components/mindmap/";
import { Toolbar } from "@/components/mindmap/toolbar";
import { Button, CollaborateDialog, ImportDialog, ShareDialog, Skeleton, UpgradePlanDialog } from "@/components/ui";
import { useSocket } from "@/hooks";
import { Link } from "@/navigation";
import {
  collaborateModalState,
  collaboratorNameState,
  importModalState,
  promptResultState,
  promptValueState,
  qaState,
  shareModalState,
  upgradePlanModalState,
  usernameState,
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

  const [currentCollaUsername, setCurrentCollaUsername] = useRecoilState(usernameState);
  const [collaUsername, setCollaUsername] = useRecoilState(collaboratorNameState);

  const [collaCursorPos, setCollaCursorPos] = useState<any>({});

  const session = useSession();
  const safeSession = session ? (session as unknown as CustomSession) : null;

  const { socketEmit, socketListen, socketOff, socketJoinRoom } = useSocket();

  useEffect(() => {
    const username = session.data?.session?.user?.username;

    if (username) {
      setCurrentCollaUsername(username);
    } else {
      const usernameFromStorage = sessionStorage.getItem("collaUsername");
      let username = usernameFromStorage ?? generateUsername();

      sessionStorage.setItem("collaUsername", username);

      setCurrentCollaUsername(username);
    }
  }, [session]);

  useEffect(() => {
    if (currentCollaUsername) socketJoinRoom(params.id, currentCollaUsername);
  }, [currentCollaUsername]);

  const getUserMindmapById = async () => {
    const mindmapData = await getMindmapById({ session: safeSession, mindmapId: params.id });

    return mindmapData;
  };

  const { isLoading, data: userMindmapDetails } = useQuery<MindMapDetailsProps>(
    ["mindmap", params.id],
    getUserMindmapById,
    {
      refetchOnMount: false,
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
        <main className="relative flex justify-between w-screen h-screen scroll-smooth">
          <BackDropGradient />
          <div className="flex justify-between w-[96%] fixed left-2/4 -translate-x-2/4 top-5 z-50">
            <NavLeft userMindmapDetails={userMindmapDetails} />
            <NavRight userMindmapDetails={userMindmapDetails} />
          </div>

          <div className="w-full">
            <div className="relative w-full h-full">
              {isLoading && currentCollaUsername !== undefined ? (
                <div className="relative flex w-full h-full">
                  <Skeleton className="bg-primary-opaque dark:bg-gray-700 w-full h-full" />
                  <Spinner
                    className="absolute inset-0 flex items-center justify-center"
                    loadingText={"Preparing your mindmap"}
                  />
                </div>
              ) : (
                // <Mindmap userMindmapDetails={userMindmapDetails} currentCollaUsername={currentCollaUsername} />
                // <Canvas boardId={userMindmapDetails.id} />
                <Whiteboard />
              )}
            </div>
          </div>
        </main>
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
