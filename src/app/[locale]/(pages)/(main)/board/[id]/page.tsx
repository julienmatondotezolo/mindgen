"use client";

import Image from "next/image";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { useRecoilState, useRecoilValue } from "recoil";

import { getMindmapById } from "@/_services";
import { MindMapDetailsProps } from "@/_types";
import arrowIcon from "@/assets/icons/arrow.svg";
import { BackDropGradient, Spinner } from "@/components";
import { Answers, PromptTextInput } from "@/components/gpt";
import { NavLeft, NavRight, ToolBar } from "@/components/header";
import { Mindmap } from "@/components/mindmap/";
import { Button, CollaborateDialog, ImportDialog, ShareDialog, Skeleton, UpgradePlanDialog } from "@/components/ui";
import { socket } from "@/socket";
import {
  collaborateModalState,
  importModalState,
  promptResultState,
  promptValueState,
  qaState,
  shareModalState,
  upgradePlanModalState,
} from "@/state";
import { scrollToBottom, scrollToTop } from "@/utils/scroll";

export default function Board({ params }: { params: { id: string } }) {
  const [promptResult, setPromptResult] = useRecoilState(promptResultState);
  const [importModal, setImportModal] = useRecoilState(importModalState);
  const [shareModal, setShareModal] = useRecoilState(shareModalState);
  const [collaborateModal, setCollaborateModal] = useRecoilState(collaborateModalState);
  const [upgradePlanModal, setUpgradePlanModal] = useRecoilState(upgradePlanModalState);
  const promptValue = useRecoilValue(promptValueState);
  const [qa, setQa] = useRecoilState(qaState);

  const [isConnected, setIsConnected] = useState(false);
  const [transport, setTransport] = useState("N/A");

  const session = useSession();

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
    {
      staleTime: 0,
      onSuccess: async (data) => {
        await joinRoom(data);

        setQa([]);
        const newQaItems = data.messages.map((mindMapQA) => ({
          text: mindMapQA.request,
          message: mindMapQA.response,
        }));

        setQa((prevQa) => [...prevQa, ...newQaItems]);
      },
    },
  );

  async function joinRoom(userMindmapDetails: MindMapDetailsProps) {
    if (session.data != undefined) {
      console.log("JOINING ROOM");
      socket.emit("join-room", {
        roomId: userMindmapDetails?.id,
        username: await session.data?.session.user.username,
      });
    }
  }

  async function leaveRoom() {
    alert("Leaving room");
    socket.emit("leave-room", {
      roomId: await userMindmapDetails?.id,
      username: await session.data?.session.user.username,
    });
  }

  useEffect(() => {
    if (socket && socket.connected && isConnected == false) {
      onConnect();
    }

    function onConnect() {
      setIsConnected(true);
      setTransport(socket.io.engine.transport.name);

      socket.io.engine.on("upgrade", (transport) => {
        setTransport(transport.name);
      });
    }

    function onDisconnect() {
      setIsConnected(false);
      setTransport("N/A");
    }

    if (socket) {
      socket.on("connect", onConnect);
      socket.on("disconnect", onDisconnect);

      return () => {
        socket.off("connect", onConnect);
        socket.off("disconnect", onDisconnect);
      };
    }
  }, []);

  // console.log("roomId:", userMindmapDetails?.id);
  // console.log("session:", session.data?.session.user.username);

  return (
    <>
      <div className="fixed right-0 bottom-0 p-10 z-50">
        {isConnected ? <Button onClick={() => leaveRoom()}>Leave room</Button> : <></>}
        <p>Status: {isConnected ? "connected" : "disconnected"}</p>
        <p>Transport: {transport}</p>
      </div>
      <main className="relative flex justify-between w-screen h-screen scroll-smooth">
        <BackDropGradient />
        <div className="flex justify-between w-[96%] fixed left-2/4 -translate-x-2/4 top-5 z-50">
          <NavLeft userMindmapDetails={userMindmapDetails} />
          <ToolBar userMindmapDetails={userMindmapDetails} />
          <NavRight />
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
            {isLoading ? (
              <div className="relative flex w-full h-full">
                <Skeleton className="bg-primary-opaque dark:bg-gray-700 w-full h-full" />
                <Spinner
                  className="absolute inset-0 flex items-center justify-center"
                  loadingText={"Preparing your mindmap"}
                />
              </div>
            ) : (
              <Mindmap userMindmapDetails={userMindmapDetails} />
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
      <CollaborateDialog open={collaborateModal} setIsOpen={setCollaborateModal} />
      <UpgradePlanDialog open={upgradePlanModal} setIsOpen={setUpgradePlanModal} />
    </>
  );
}
