"use client";

import { ChannelProvider } from "ably/react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import React from "react";
import { useQuery } from "react-query";

import { getMindmapById } from "@/_services/mindgen/mindgenService";
import { CustomSession } from "@/_types";
import { NavLeft } from "@/components/header";
import { MindBoard } from "@/components/mindboard/MindBoard";
import { Skeleton, Spinner } from "@/components/ui";

const MindBoardPage = () => {
  const boardId = "46cfe746-0754-473d-ab89-ddfbca7e4281";
  const session = useSession();
  const safeSession = session ? (session as unknown as CustomSession) : null;

  const text = useTranslations("Index");

  // Fetch mindmap data only on initial page load
  const { data: boardData, isLoading } = useQuery(
    ["mindmap", boardId],
    () => getMindmapById({ session: safeSession, mindmapId: boardId }),
    {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      staleTime: Infinity,
      enabled: !!safeSession, // Only run the query if we have a session
    },
  );

  if (isLoading)
    return (
      <div className="flex w-full h-full fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50">
        <Skeleton className="bg-primary-opaque dark:bg-gray-700 w-full h-full" />
        <Spinner
          className="absolute inset-0 flex items-center justify-center"
          loadingText={`${text("loading")} board`}
        />
      </div>
    );

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <div className="flex justify-between w-[96%] fixed left-2/4 -translate-x-2/4 top-5 z-50">
        <NavLeft userMindmapDetails={boardData} />
      </div>
      <ChannelProvider channelName={boardId}>
        <MindBoard boardData={boardData} />
      </ChannelProvider>
    </div>
  );
};

export default MindBoardPage;
