/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import Image from "next/image";
import React from "react";
import { useIsMutating, useQuery } from "react-query";

import { fetchMindmaps } from "@/_services";
import { MindmapObject } from "@/_types";
import documentIcon from "@/assets/icons/delete.svg";
import { formatDate } from "@/utils";

import { SkeletonMindMapBoard } from "../ui/SkeletonMindMapBoard";

const fetchUserMindmaps = () => fetchMindmaps();

function MindMapBoards() {
  const size = 10;

  const handleDelete = (id: string) => {
    console.log("id:", id);
  };

  const { isLoading, data: userMindmap } = useQuery("userMindmap", fetchUserMindmaps);
  const isCreatingMindmap = useIsMutating({ mutationKey: "CREATE_MINDMAP" });

  if (isLoading) return Array.from({ length: 3 }).map((_, index) => <SkeletonMindMapBoard key={index} />);

  return (
    <>
      {userMindmap.map((mindmap: MindmapObject) => (
        <div key={mindmap.id}>
          <figure className="gradientPrimary w-full h-24 border-2 mb-2 rounded-xl"></figure>
          <article className="flex flex-wrap justify-between items-start">
            <div>
              <p className="text-sm font-medium">{mindmap.name}</p>
              <p className="text-xs text-primary-color">Created by {mindmap.creatorUsername}</p>
              <p className="text-xs text-primary-color">{formatDate(mindmap.createdAt)}</p>
            </div>
            <figure
              onClick={() => handleDelete(mindmap.id)}
              className="bg-red-50 px-3 py-2 cursor-pointer rounded-[10%] hover:bg-red-200"
            >
              <Image src={documentIcon} height={size} width={size} alt="document icon" />
            </figure>
          </article>
        </div>
      ))}
      {isCreatingMindmap ? <SkeletonMindMapBoard /> : <></>}
    </>
  );
}

export { MindMapBoards };
