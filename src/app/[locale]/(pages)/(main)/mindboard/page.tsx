"use client";

import { ChannelProvider } from "ably/react";
import React from "react";

import { NavLeft } from "@/components/header";
import { MindBoard } from "@/components/mindboard/MindBoard";

const MindBoardPage = () => {
  const channelName = `mindmap-mindboard`;

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <div className="flex justify-between w-[96%] fixed left-2/4 -translate-x-2/4 top-5 z-50">
        <NavLeft userMindmapDetails={undefined} />
      </div>
      <ChannelProvider channelName={channelName}>
        <MindBoard />
      </ChannelProvider>
    </div>
  );
};

export default MindBoardPage;
