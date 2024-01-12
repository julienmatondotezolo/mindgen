import React from "react";
import { useQuery } from "react-query";

import { fetchMindmaps } from "@/_services";
import { MindmapObject } from "@/_types";

import { Skeleton } from "../ui/skeleton";

const fetchUserMindmaps = () => fetchMindmaps();

function MindMapBoards() {
  const { isLoading, data: userMindmap } = useQuery("userMindmap", fetchUserMindmaps);

  if (isLoading)
    return Array.from({ length: 3 }).map((_, index) => (
      <section key={index} className="flex flex-wrap flex-col w-56">
        <Skeleton className="h-24 w-full rounded-xl mb-4 bg-grey-blue" />
        <article className=" space-y-2">
          <Skeleton className="h-3 w-28 bg-grey-blue" />
          <Skeleton className="h-2 w-36 bg-grey-blue" />
          <Skeleton className="h-2 w-24 bg-grey-blue" />
        </article>
      </section>
    ));

  return (
    <>
      {userMindmap.map((mindmap: MindmapObject, index: number) => (
        <div key={index} className="float-left mr-4">
          <figure className="gradientPrimary w-56 h-24 border-2 mb-2 rounded-xl"></figure>
          <article>
            <p className="text-sm font-medium">{mindmap.name}</p>
            <p className="text-xs text-primary-color">Created by {mindmap.creatorUsername}</p>
            <p className="text-xs text-primary-color">{mindmap.createdAt}</p>
          </article>
        </div>
      ))}
    </>
  );
}

export { MindMapBoards };
