/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import Image from "next/image";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { useIsMutating, useMutation, useQuery, useQueryClient } from "react-query";
import { useRecoilState } from "recoil";

import { deleteMindmapById, fetchMindmaps } from "@/_services";
import { MindmapObject } from "@/_types";
import deleteIcon from "@/assets/icons/delete.svg";
import settingsIcon from "@/assets/icons/settings.svg";
import { SkeletonMindMapBoard, Spinner } from "@/components/ui";
import { modalState } from "@/state";
import { checkPermission, formatDate, uppercaseFirstLetter } from "@/utils";

import { Link } from "../../navigation";

const fetchUserMindmaps = () => fetchMindmaps();

function MindMapBoards() {
  const text = useTranslations("Index");
  const dateText = useTranslations("Dashboard");

  const size = 10;

  const [, setTitle] = useState("");
  const [, setDescription] = useState("false");

  const handleUpdate = (mindmapName: string, mindMapDescription: string) => {
    setTitle(mindmapName);
    setDescription(mindMapDescription);
    // setIsOpen(!isOpen);
  };

  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation(deleteMindmapById);
  const { isLoading, data: userMindmap } = useQuery("userMindmap", fetchUserMindmaps, {
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
  const PERMISSIONS = userMindmap?.connectedCollaboratorPermissions;
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
              <figure
                className="relative group gradientPrimary w-full h-24 border-2 dark:border-slate-800 mb-2 rounded-xl cursor-pointer"
                style={{
                  backgroundImage: `url(${mindmap.pictureUrl})`,
                  backgroundSize: "cover",
                  backgroundRepeat: "no-repeat",
                }}
              >
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
                <p className="text-sm font-medium dark:text-white">{mindmap.name}</p>
                <p className="text-xs text-grey">
                  {text("createdBy")}{" "}
                  <span className="text-primary-color cursor-pointer hover:underline">
                    {uppercaseFirstLetter(mindmap.creatorUsername)}
                  </span>
                </p>
                <p className="text-xs text-grey">{formatDate(mindmap.createdAt, dateText)}</p>
              </div>
              {checkPermission(PERMISSIONS, "DELETE") && (
                <figure
                  onClick={() => handleDelete(mindmap.id)}
                  className="bg-[rgba(255,0,0,0.05)] hover:bg-[rgba(255,0,0,0.15)] dark:bg-[rgba(255,0,0,0.15)] dark:hover:bg-[rgba(255,111,111,0.25)] px-3 py-2 cursor-pointer rounded-[10%"
                >
                  {!isDeleting ? <Image src={deleteIcon} height={size} alt="document icon" /> : <Spinner />}
                </figure>
              )}
            </article>
          </div>
        ))}
        {isCreatingMindmap ? <SkeletonMindMapBoard /> : <></>}
      </>
    );
}

export { MindMapBoards };
