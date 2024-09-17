"use client";

import Image from "next/image";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { generateUsername } from "unique-username-generator";

import { getMindmapById } from "@/_services";
import { CustomSession, MindMapDetailsProps, User } from "@/_types";
import arrowIcon from "@/assets/icons/arrow.svg";
import { BackDropGradient, Spinner, Whiteboard } from "@/components";
import { Answers, PromptTextInput } from "@/components/gpt";
import { NavLeft, NavRight } from "@/components/header";
import { Button, CollaborateDialog, ImportDialog, ShareDialog, Skeleton, UpgradePlanDialog } from "@/components/ui";
import { useSocket } from "@/hooks";
import { Link } from "@/navigation";
import {
  collaborateModalState,
  collaboratorNameState,
  currentUserState,
  edgesAtomState,
  importModalState,
  layerAtomState,
  mindmapDataState,
  promptResultState,
  promptValueState,
  qaState,
  shareModalState,
  upgradePlanModalState,
  usernameState,
} from "@/state";
import { refreshPage } from "@/utils";
import { scrollToBottom, scrollToTop } from "@/utils/scroll";

export default function Board({ params }: { params: { id: string } }) {
  const text = useTranslations("Index");
  const [promptResult, setPromptResult] = useRecoilState(promptResultState);
  const [importModal, setImportModal] = useRecoilState(importModalState);
  const [shareModal, setShareModal] = useRecoilState(shareModalState);
  const [collaborateModal, setCollaborateModal] = useRecoilState(collaborateModalState);
  const [upgradePlanModal, setUpgradePlanModal] = useRecoilState(upgradePlanModalState);
  const setLayers = useSetRecoilState(layerAtomState);
  const setEdges = useSetRecoilState(edgesAtomState);
  const promptValue = useRecoilValue(promptValueState);
  const [qa, setQa] = useRecoilState(qaState);

  const [currentCollaUsername, setCurrentCollaUsername] = useRecoilState(usernameState);
  // const [collaUsername, setCollaUsername] = useRecoilState(collaboratorNameState);
  const setCurrentUser = useSetRecoilState(currentUserState);

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
  }, [session, setCurrentCollaUsername]);

  useEffect(() => {
    const user: User = {
      id: session.data?.session?.user?.id,
      username: session.data?.session?.user?.username,
    };

    // if (currentCollaUsername) socketJoinRoom(params.id, user.id, currentCollaUsername);
    setCurrentUser(user);
  }, [currentCollaUsername, session, setCurrentUser]);

  function handleScrollTop() {
    if (promptResult) {
      scrollToTop();
      setPromptResult(false);
    } else {
      scrollToBottom();
      setPromptResult(true);
    }
  }

  const [userMindmapDetails, setUserMindmapDetails] = useRecoilState(mindmapDataState);

  useEffect(() => {
    const getUserMindmapById = async () => {
      const mindmapData = await getMindmapById({ session: safeSession, mindmapId: params.id });

      return mindmapData;
    };

    const fetchData = async () => {
      if (!userMindmapDetails) {
        // Only fetch if data is not already available
        const data: MindMapDetailsProps = await getUserMindmapById();

        setUserMindmapDetails(data);
        setLayers(data.layers);
        setEdges(data.edges);

        if (data.messages) {
          setQa([]);

          const newQaItems = data.messages.map((mindMapQA) => ({
            text: mindMapQA.request,
            message: mindMapQA.response,
          }));

          setQa((prevQa) => [...prevQa, ...newQaItems]);
        }
      }
    };

    fetchData();
  }, [userMindmapDetails, setUserMindmapDetails, params.id, safeSession, setLayers, setEdges, setQa]);

  if (!userMindmapDetails)
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

          <div className="sm:w-[40%] w-[90%] fixed left-2/4 -translate-x-2/4 bottom-6 z-10">
            {userMindmapDetails ? (
              <PromptTextInput userMindmapDetails={userMindmapDetails} />
            ) : (
              <Skeleton className="w-full max-h-36 h-12 bg-grey-blue rounded-xl" />
            )}
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
                alt="Stars icon"
              />
            </Button>
          </div>

          <div className="w-full">
            <div className="relative w-full h-full">
              {!userMindmapDetails && currentCollaUsername !== undefined ? (
                <div className="relative flex w-full h-full">
                  <Skeleton className="bg-primary-opaque dark:bg-gray-700 w-full h-full" />
                  <Spinner
                    className="absolute inset-0 flex items-center justify-center"
                    loadingText={"Preparing your mindmap"}
                  />
                </div>
              ) : (
                <Whiteboard boardId={userMindmapDetails.id} />
              )}
            </div>
            {qa.length > 0 && (
              <div className="relative w-full h-full flex flex-row justify-center bg-background">
                <Answers />
              </div>
            )}
          </div>
        </main>
        <ImportDialog open={importModal} setIsOpen={setImportModal} />
        <ShareDialog open={shareModal} setIsOpen={setShareModal} />
        <CollaborateDialog
          open={collaborateModal}
          setIsOpen={setCollaborateModal}
          mindmapId={params.id}
          userMindmap={userMindmapDetails}
        />
        <UpgradePlanDialog open={upgradePlanModal} setIsOpen={setUpgradePlanModal} />
      </>
    );

  if (userMindmapDetails)
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
