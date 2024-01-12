import React from "react";
import { useIsMutating, useQuery } from "react-query";

import { fetchMindmaps } from "@/_services";
import { MindmapObject } from "@/_types";
import { formatDate } from "@/utils";

import { SkeletonMindMapBoard } from "../ui/SkeletonMindMapBoard";

const fetchUserMindmaps = () => fetchMindmaps();

function MindMapBoards() {
  const { isLoading, data: userMindmap } = useQuery("userMindmap", fetchUserMindmaps);
  const isCreatingMindmap = useIsMutating({ mutationKey: "CREATE_MINDMAP" });

  if (isLoading) return Array.from({ length: 3 }).map((_, index) => <SkeletonMindMapBoard key={index} />);

  return (
    <>
      {userMindmap.map((mindmap: MindmapObject) => (
        <div key={mindmap.id} className="float-left mb-8 mr-6">
          <figure className="gradientPrimary w-56 h-24 border-2 mb-2 rounded-xl"></figure>
          <article>
            <p className="text-sm font-medium">{mindmap.name}</p>
            <p className="text-xs text-primary-color">Created by {mindmap.creatorUsername}</p>
            <p className="text-xs text-primary-color">{formatDate(mindmap.createdAt)}</p>
          </article>
        </div>
      ))}
      {isCreatingMindmap ? <SkeletonMindMapBoard /> : <></>}
    </>
  );
}

export { MindMapBoards };
