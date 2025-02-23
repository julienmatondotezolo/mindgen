"use client";

import { MindMapDetailsProps } from "@/_types";
import { BackDropGradient, TestWhiteboard } from "@/components";

export default function Board() {
  const emptyMindmapDetails: MindMapDetailsProps = {
    id: "",
    layers: [],
    edges: [],
    name: "",
    description: "",
    conversation: [],
    creatorId: "",
    creatorUsername: "",
    picture_url: "",
    members: [],
    connectedMemberPermissions: [],
    teams: [],
    visibility: "",
  };

  return (
    <>
      <main className="relative flex justify-between w-screen h-screen scroll-smooth">
        <BackDropGradient />
        <div className="w-full">
          <div className="relative w-full h-full">
            <TestWhiteboard userMindmapDetails={emptyMindmapDetails} />
          </div>
        </div>
      </main>
    </>
  );
}
