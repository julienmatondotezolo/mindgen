/* eslint-disable prettier/prettier */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import Image from "next/image";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { useIsMutating, useMutation, useQuery, useQueryClient } from "react-query";
import { useRecoilValue } from "recoil";

import { deleteMindmapById, fetchMindmaps } from "@/_services";
import { MindmapObject, Organization } from "@/_types";
import deleteIcon from "@/assets/icons/delete.svg";
import { SkeletonMindMapBoard, Spinner } from "@/components/ui";
import { selectedOrganizationState } from "@/state";
import { checkPermission, formatDate, uppercaseFirstLetter } from "@/utils";

import { Link } from "../../navigation";

function MindMapBoards() {
  const text = useTranslations("Index");
  const dateText = useTranslations("Dashboard");

  const size = 10;

  const [deletingMindmapId, setDeletingMindmapId] = useState("");

  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation(deleteMindmapById);

  const selectedOrga = useRecoilValue<Organization | undefined>(selectedOrganizationState);

  const fetchUserMindmaps = () => fetchMindmaps({ organizationId: selectedOrga!.id });
  const { isLoading, data: userMindmap } = useQuery(["userMindmap", selectedOrga?.id], fetchUserMindmaps, {
    enabled: !!selectedOrga?.id, // Only run the query if selectedOrga.id is available
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
  const [, setIsDeleting] = useState(false);
  const isCreatingMindmap = useIsMutating({ mutationKey: "CREATE_MINDMAP" });

  const handleDelete = async (mindMapId: string) => {
    try {
      setDeletingMindmapId(mindMapId);
      setIsDeleting(true);
      await mutateAsync(mindMapId, {
        onSuccess: () => {
          // Invalidate the query to cause a re-fetch
          queryClient.invalidateQueries("userMindmap");
          setIsDeleting(false);
          setDeletingMindmapId("");
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
        {isLoading
          ? Array.from({ length: 3 }).map((_, index) => <SkeletonMindMapBoard key={index} />)
          : userMindmap.map((mindmap: MindmapObject) => (
            <div
              key={mindmap.id}
              className={`relative ${
                deletingMindmapId === mindmap.id ? "opacity-20" : "opacity-100"
              } cursor-pointer rounded-xl group overflow-hidden border dark:border-slate-900`}
              style={{
                backgroundImage: `url(${mindmap.pictureUrl})`,
                backgroundSize: "150%",
                backgroundPosition: "center center",
                backgroundRepeat: "no-repeat",
              }}
            >
              <Link href={`/board/${mindmap.id}`}>
                <figure className="w-full h-24" />
              </Link>
              <article className="flex flex-wrap justify-between items-start p-2 bg-white bg-opacity-60 backdrop-filter backdrop-blur-md dark:bg-slate-800 dark:bg-opacity-50">
                <section className="w-[90%]">
                  <p className="mb-2 text-sm font-medium dark:text-white truncate overflow-hidden text-ellipsis">{mindmap.name}</p>
                  <p className="text-xs text-grey">
                    {text("createdBy")}{" "}
                    <span className="text-primary-color cursor-pointer hover:underline">
                      {uppercaseFirstLetter(mindmap.creatorUsername)}
                    </span>
                  </p>
                  <p className="text-xs text-grey">{formatDate(mindmap.createdAt, dateText)}</p>
                </section>
                {checkPermission(mindmap.connectedMemberPermissions, "DELETE") && (
                  <figure
                    onClick={() => handleDelete(mindmap.id)}
                    className="hidden absolute bottom-4 right-4 group-hover:block bg-[rgba(255,0,0,0.05)] hover:bg-[rgba(255,0,0,0.15)] dark:bg-[rgba(255,0,0,0.15)] dark:hover:bg-[rgba(255,111,111,0.25)] px-3 py-2 cursor-pointer rounded-[10%]"
                  >
                    {!deletingMindmapId || deletingMindmapId !== mindmap.id ? (
                      <Image src={deleteIcon} height={size} alt="document icon" />
                    ) : (
                      <Spinner />
                    )}
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
