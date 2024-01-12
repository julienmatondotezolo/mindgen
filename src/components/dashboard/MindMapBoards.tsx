/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import Image from "next/image";
import React from "react";
import { useIsMutating, useMutation, useQuery, useQueryClient } from "react-query";

import { deleteMindmapById, fetchMindmaps } from "@/_services";
import { MindmapObject } from "@/_types";
import documentIcon from "@/assets/icons/delete.svg";
import { SkeletonMindMapBoard } from "@/components/ui";
import { formatDate, uppercaseFirstLetter } from "@/utils";

const fetchUserMindmaps = () => fetchMindmaps();

function MindMapBoards() {
  const size = 10;

  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation(deleteMindmapById);
  const { isLoading, data: userMindmap } = useQuery("userMindmap", fetchUserMindmaps);
  const isCreatingMindmap = useIsMutating({ mutationKey: "CREATE_MINDMAP" });

  const handleDelete = async (mindMapId: string) => {
    try {
      await mutateAsync(mindMapId, {
        onSuccess: () => {
          // Invalidate the query to cause a re-fetch
          queryClient.invalidateQueries("userMindmap");
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error(`An error has occurred: ${error.message}`);
      }
    }
  };

  if (isLoading) return Array.from({ length: 3 }).map((_, index) => <SkeletonMindMapBoard key={index} />);

  return (
    <>
      {userMindmap.map((mindmap: MindmapObject) => (
        <div key={mindmap.id}>
          <figure className="gradientPrimary w-full h-24 border-2 mb-2 rounded-xl"></figure>
          <article className="flex flex-wrap justify-between items-start">
            <div>
              <p className="text-sm font-medium">{mindmap.name}</p>
              <p className="text-xs text-grey">
                Created by{" "}
                <span className="text-primary-color cursor-pointer hover:underline">
                  {uppercaseFirstLetter(mindmap.creatorUsername)}
                </span>
              </p>
              <p className="text-xs text-grey">{formatDate(mindmap.createdAt)}</p>
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
