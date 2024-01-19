/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { useIsMutating, useMutation, useQuery, useQueryClient } from "react-query";

import { deleteMindmapById, fetchMindmaps } from "@/_services";
import { MindmapObject } from "@/_types";
import deleteIcon from "@/assets/icons/delete.svg";
import settingsIcon from "@/assets/icons/settings.svg";
import { SkeletonMindMapBoard, Spinner } from "@/components/ui";
import { formatDate, uppercaseFirstLetter } from "@/utils";

import { MindmapDialog } from "../ui/mindmapDialog";

const fetchUserMindmaps = () => fetchMindmaps();

function MindMapBoards() {
  const size = 10;

  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("false");

  const handleUpdate = (mindmapName: string, mindMapDescription: string) => {
    setTitle(mindmapName);
    setDescription(mindMapDescription);
    // setIsOpen(!isOpen);
  };

  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation(deleteMindmapById);
  const { isLoading, data: userMindmap } = useQuery("userMindmap", fetchUserMindmaps);
  const [isDeleting, setIsDeleting] = useState(false);
  const isCreatingMindmap = useIsMutating({ mutationKey: "CREATE_MINDMAP" });

  const handleDelete = async (mindMapId: string) => {
    try {
      setIsDeleting(true);
      await mutateAsync(mindMapId, {
        onSuccess: () => {
          // Invalidate the query to cause a re-fetch
          queryClient.invalidateQueries("userMindmap");
          setIsDeleting(false);
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error(`An error has occurred: ${error.message}`);
      }
    }
  };

  if (isLoading) return Array.from({ length: 3 }).map((_, index) => <SkeletonMindMapBoard key={index} />);

  if (userMindmap)
    return (
      <>
        {userMindmap.map((mindmap: MindmapObject) => (
          <div key={mindmap.id} className={isDeleting ? "opacity-20" : "opacity-100"}>
            <Link href={`/board/${mindmap.id}`}>
              <figure className="relative group gradientPrimary w-full h-24 border-2 mb-2 rounded-xl cursor-pointer">
                <div
                  onClick={() => handleUpdate(mindmap.name, mindmap.description)}
                  className="z-50 absolute top-2 left-2 group-hover:opacity-100 opacity-0 transition duration-200 ease-in-out p-2 bg-primary-opaque border-grey-blue border-2 rounded-[10%]"
                >
                  <Image src={settingsIcon} height={size} width={size} alt="document icon" />
                </div>
              </figure>
            </Link>
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
                {!isDeleting ? <Image src={deleteIcon} height={size} alt="document icon" /> : <Spinner />}
              </figure>
            </article>
          </div>
        ))}
        {isCreatingMindmap ? <SkeletonMindMapBoard /> : <></>}

        <MindmapDialog title={title} description={description} open={isOpen} update={true} setIsOpen={setIsOpen} />
      </>
    );
}

export { MindMapBoards };
