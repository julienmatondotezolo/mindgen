/* eslint-disable prettier/prettier */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { image } from "html2canvas/dist/types/css/types/image";
import { Star } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import React, { useState } from "react";
import { useIsMutating, useMutation, useQuery, useQueryClient } from "react-query";
import { useRecoilValue, useSetRecoilState } from "recoil";

import { deleteMindmapById, favoriteMindmap, fetchMindmaps } from "@/_services";
import { CustomSession, Filter, MindmapObject, Organization } from "@/_types";
import deleteIcon from "@/assets/icons/delete.svg";
import boardElement from "@/assets/images/elements.svg";
import { SkeletonMindMapBoard, Spinner } from "@/components/ui";
import { boardsLengthState, globalFilterState, selectedOrganizationState } from "@/state";
import { checkPermission, formatDate, uppercaseFirstLetter } from "@/utils";

import { Link } from "../../navigation";

function MindMapBoards() {
  const text = useTranslations("Index");
  const dateText = useTranslations("Dashboard");

  const session: any = useSession();
  const safeSession = session ? (session as unknown as CustomSession) : null;

  const { theme } = useTheme();

  const setBoardLength = useSetRecoilState(boardsLengthState);
  const globalFilter = useRecoilValue(globalFilterState);

  const size = 10;

  const [deletingMindmapId, setDeletingMindmapId] = useState("");

  const PLACEHOLDER_IMAGE = "https://fakeimg.pl/600x400/94baf7/0566fe?text=Mindgen";

  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation(deleteMindmapById);

  const selectedOrga = useRecoilValue<Organization | undefined>(selectedOrganizationState);

  const searchParams = useSearchParams();
  const showFavorites = searchParams.get('favourites') === 'true';
  const showUserMindmaps = searchParams.get('usermindmaps') === 'true';

  const fetchUserMindmaps = () => fetchMindmaps({ session:safeSession, organizationId: selectedOrga!.id });
  const { isLoading, data: userMindmap } = useQuery(["userMindmap", selectedOrga?.id], fetchUserMindmaps, {
    enabled: !!selectedOrga?.id,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    select: (data) => {
      // First filter by favorites and/or user mindmaps if needed
      let filteredData = data;
      
      if (showFavorites) {
        filteredData = filteredData.filter((mindmap: MindmapObject) => mindmap.favorite);
      }
      
      if (showUserMindmaps) {
        filteredData = filteredData.filter((mindmap: MindmapObject) => 
          mindmap.creatorUsername === safeSession?.data.session.user.username
        );
      }
      
      // Then sort by date
      return filteredData.sort((a: any, b: any) => {
        const dateA = new Date(a.updatedAt).getTime();
        const dateB = new Date(b.updatedAt).getTime();

        return dateB - dateA;
      });
    },
    onSuccess: (data: MindmapObject[]) => {
      if (data) setBoardLength(data.length);
    },
  });
  const [, setIsDeleting] = useState(false);
  const isCreatingMindmap = useIsMutating({ mutationKey: "CREATE_MINDMAP" });

  const fetchFavoriteMindmap = useMutation(favoriteMindmap, {
    onSuccess: async (data: any) => {
      const response = await data;

      if (response.id !== "") {
        // Invalidate the query to cause a re-fetch
        queryClient.invalidateQueries("userMindmap");
      }
    },
  });

  const handleFavoriteMindmap = async (mindmapId: string) => {
    try {
      await fetchFavoriteMindmap.mutateAsync({ mindmapId });
    } catch (error) {
      if (error instanceof Error) {
        console.error(`An error has occurred: ${error.message}`);
      }
    }
  };

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

  if (userMindmap && userMindmap!.length > 0) {
    return (
      <>
        {isLoading
          ? Array.from({ length: 3 }).map((_, index) => <SkeletonMindMapBoard key={index} />)
          : userMindmap.map((mindmap: MindmapObject) => (
            <Link key={mindmap.id} href={`/board/${mindmap.id}`}>
              <div
                className={`relative ${
                  deletingMindmapId === mindmap.id ? "opacity-20" : "opacity-100"
                } cursor-pointer rounded-xl group overflow-hidden border dark:border-slate-900`}
                style={{
                  backgroundImage: `${globalFilter === Filter.Grid ? `url(${mindmap.pictureUrl || PLACEHOLDER_IMAGE})` : "url()"}`,
                  backgroundSize: "150%",
                  backgroundPosition: "center center",
                  backgroundRepeat: "no-repeat",
                }}
              >
                <figure onClick={(e) => handleFavoriteMindmap(e, mindmap.id)} className={`${mindmap.favorite ? "block" : "hidden"} group-hover:block absolute top-4 right-4 px-3 py-2 cursor-pointer rounded-[10%] hover:bg-primary-opaque hover:dark:bg-slate-600 bg-[#f3f5f7] dark:bg-slate-500 dark:bg-opacity-20`}>
                  <Star size={16} color={theme == "dark" ? "white" : "black"} fill={mindmap.favorite ? "#ffcd29" : "transparent"} />
                </figure>
                {globalFilter === Filter.Grid &&
                <figure className="w-full h-24" />}
                <article className="flex flex-wrap justify-between items-start p-2 bg-white bg-opacity-60 backdrop-filter backdrop-blur-md dark:bg-slate-800 dark:bg-opacity-50">
                  <section className={`w-[90%] ${globalFilter === Filter.List && "p-3 grid grid-cols-3 items-center h-18 overflow-hidden"}`}>
                    <article className="flex space-x-6 items-center w-full">
                      {globalFilter === Filter.List && (
                        <figure className="border dark:border-none w-1/4">
                          <Image src={mindmap.pictureUrl} width={0} height={0} className="w-full h-auto" sizes="100vw"
                            alt="document icon" />
                        </figure>)
                      }
                      <section className="w-3/4">
                        <p className="mb-2 text-sm font-medium dark:text-white w-full">{mindmap.name}</p>
                        {globalFilter === Filter.List && <p className="text-xs">{truncateText({ string: mindmap.description, maxLength: 30 })}</p>}
                      </section>
                    </article>
                    <article>
                      <p className="text-xs text-grey">
                        {text("createdBy")}{" "}
                        <span className="text-primary-color cursor-pointer hover:underline">
                          {uppercaseFirstLetter(mindmap.creatorUsername)}
                        </span>
                      </p>
                      <p className="text-xs text-grey">Updated <span className="cursor-pointer hover:underline">{formatDate(mindmap.updatedAt, dateText)}</span></p>
                    </article>
                  </section>
                  {globalFilter === Filter.List && <figure onClick={() => handleFavoriteMindmap(mindmap.id)} className={`${mindmap.favorite ? "block" : "hidden"} group-hover:block absolute ${globalFilter === Filter.List ? "translate-y-1/2 bottom-1/2 right-16" : "top-4"} right-4 px-2 py-2 cursor-pointer rounded-[10%] hover:bg-primary-opaque hover:dark:bg-slate-600 bg-[#f3f5f7] dark:bg-slate-500 dark:bg-opacity-20`}>
                    <Star size={16} color={theme == "dark" ? "white" : "black"} fill={mindmap.favorite ? "#ffcd29" : "transparent"} />
                  </figure>}
                  {checkPermission(mindmap.connectedMemberPermissions, "DELETE") && (
                    <figure
                      onClick={() => handleDelete(mindmap.id)}
                      className={`hidden absolute z-50 ${globalFilter === Filter.List ? "translate-y-1/2 bottom-1/2" : "bottom-4"} right-4 group-hover:block bg-[rgba(255,0,0,0.05)] hover:bg-[rgba(255,0,0,0.15)] dark:bg-[rgba(255,0,0,0.15)] dark:hover:bg-[rgba(255,111,111,0.25)] px-3 py-2 cursor-pointer rounded-[10%]`}
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
            </Link>
          ))}
        {isCreatingMindmap ? <SkeletonMindMapBoard /> : <></>}
      </>
    );
  } else {
    return (
      <>
        <div></div>
        <div className="flex flex-col items-center overflow-hidden rounded-xl h-48">
          <div className="m-auto space-y-4">
            <Image className="m-auto" src={boardElement} alt="Empty" height={60} />
            <article className="m-auto text-center w-3/4">
              <p className="text-sm font-medium dark:text-white">There are no boards</p>
              <p className="text-xs opacity-50">Create a new board to start from scratch. Or, generate on using a template.</p>
            </article>
          </div>
        </div>
      </>);
  }
}

export { MindMapBoards };
