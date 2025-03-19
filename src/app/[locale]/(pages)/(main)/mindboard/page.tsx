"use client";

import React from "react";

import { NavLeft } from "@/components/header";
import { MindBoard } from "@/components/mindboard/MindBoard";

const MindBoardPage = () => (
  <div style={{ width: "100vw", height: "100vh" }}>
    <div className="flex justify-between w-[96%] fixed left-2/4 -translate-x-2/4 top-5 z-50">
      <NavLeft userMindmapDetails={undefined} />
    </div>
    <MindBoard />
  </div>
);

export default MindBoardPage;
