import { motion } from "framer-motion";
import { LayoutGrid, List, Search, Star } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { useRecoilValue, useSetRecoilState } from "recoil";

import { favoriteMindmap, fetchMindmaps } from "@/_services";
import { CustomSession, Filter, MindmapObject, Organization } from "@/_types";
import deleteIcon from "@/assets/icons/delete.svg";
import boardElement from "@/assets/images/elements.svg";
import { SkeletonMindMapBoard } from "@/components/ui";
import {
  boardsLengthState,
  boardToDeleteState,
  deleteBoardModalState,
  globalFilterState,
  selectedOrganizationState,
} from "@/state";
import { checkPermission, formatDate, uppercaseFirstLetter } from "@/utils";

import { Link } from "../../navigation";

function MindMapBoards() {
  const text = useTranslations("Index");
  const dateText = useTranslations("Dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const session: any = useSession();
  const safeSession = session ? (session as unknown as CustomSession) : null;
  const setBoardLength = useSetRecoilState(boardsLengthState);
  const setBoardToDelete = useSetRecoilState(boardToDeleteState);
  const setBoardModalState = useSetRecoilState(deleteBoardModalState);
  const globalFilter = useRecoilValue(globalFilterState);
  const [, setDeletingBoardId] = useState("");
  const PLACEHOLDER_IMAGE = "https://fakeimg.pl/600x400/94baf7/0566fe?text=Mindgen";
  const queryClient = useQueryClient();
  const selectedOrga = useRecoilValue<Organization | undefined>(selectedOrganizationState);
  const setGlobalFilter = useSetRecoilState(globalFilterState);
  const searchParams = useSearchParams();
  const showFavorites = searchParams.get("favourites") === "true";
  const showUserMindmaps = searchParams.get("usermindmaps") === "true";

  const fetchUserMindmaps = () => fetchMindmaps({ session: safeSession, organizationId: selectedOrga!.id });
  const { isLoading, data: userMindmap } = useQuery(["userMindmap", selectedOrga?.id], fetchUserMindmaps, {
    enabled: !!selectedOrga?.id,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    select: (data) => {
      let filteredData = data;

      if (showFavorites) {
        filteredData = filteredData.filter((mindmap: MindmapObject) => mindmap.favorite);
      }

      if (showUserMindmaps) {
        filteredData = filteredData.filter(
          (mindmap: MindmapObject) => mindmap.creatorUsername === safeSession?.data.session.user.username,
        );
      }

      if (searchTerm) {
        filteredData = filteredData.filter((mindmap: MindmapObject) =>
          mindmap.name.toLowerCase().includes(searchTerm.toLowerCase()),
        );
      }

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

  const fetchFavoriteMindmap = useMutation(favoriteMindmap, {
    onSuccess: async (data: any) => {
      const response = await data;

      if (response.id !== "") {
        queryClient.invalidateQueries("userMindmap");
      }
    },
  });

  const handleFavoriteMindmap = async (e: any, mindmapId: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await fetchFavoriteMindmap.mutateAsync({ mindmapId });
    } catch (error) {
      if (error instanceof Error) {
        console.error(`An error has occurred: ${error.message}`);
      }
    }
  };

  const handleDelete = async (e: any, board: MindmapObject) => {
    e.preventDefault();
    e.stopPropagation();
    setBoardModalState(true);
    setBoardToDelete(board);
    setDeletingBoardId(board.id);
  };

  if (isLoading)
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: 3 }).map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <SkeletonMindMapBoard />
          </motion.div>
        ))}
      </div>
    );

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  if (userMindmap && userMindmap.length > 0) {
    return (
      <div className="w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row gap-4 items-center justify-between"
        >
          <div className="relative group w-full max-w-lg">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 transition-colors group-focus-within:text-primary-color"
              size={20}
            />
            <input
              type="text"
              placeholder="Search mindmaps..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg focus:ring-2 focus:ring-primary-color/50 focus:border-transparent transition-all duration-300 placeholder:text-gray-400"
            />
            <motion.div
              className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-r from-primary-color/10 to-secondary-color/10 blur-xl"
              animate={{
                scale: [1, 1.02, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>

          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 rounded-xl bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all"
              onClick={() => setGlobalFilter(Filter.Grid)}
            >
              <LayoutGrid size={20} className={globalFilter === Filter.Grid ? "text-primary-color" : "text-gray-400"} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-3 rounded-xl bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all"
              onClick={() => setGlobalFilter(Filter.List)}
            >
              <List size={20} className={globalFilter === Filter.List ? "text-primary-color" : "text-gray-400"} />
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className={`w-full grid gap-8 ${
            globalFilter === Filter.List ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {userMindmap.map((mindmap: MindmapObject) => (
            <motion.div
              key={mindmap.id}
              variants={item}
              layout
              whileHover={{ scale: 1.02, y: -5 }}
              onHoverStart={() => setHoveredId(mindmap.id)}
              onHoverEnd={() => setHoveredId(null)}
              className="group relative"
            >
              <Link href={`/board/${mindmap.id}`}>
                <motion.div
                  className="relative h-full rounded-2xl overflow-hidden bg-white dark:bg-slate-800 shadow-lg transition-all duration-500 group-hover:shadow-2xl"
                  initial={false}
                  animate={{
                    borderColor: hoveredId === mindmap.id ? "rgb(var(--primary-color))" : "transparent",
                  }}
                >
                  <div className="relative h-48 overflow-hidden">
                    <motion.div
                      className="absolute inset-0 bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${mindmap.pictureUrl || PLACEHOLDER_IMAGE})`,
                      }}
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.4 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute top-4 right-4 flex space-x-2 backdrop-blur-md bg-white/10 p-1 rounded-full"
                    >
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => handleFavoriteMindmap(e, mindmap.id)}
                        className="p-2 rounded-full hover:bg-white/20 transition-colors"
                      >
                        <Star
                          size={18}
                          className={mindmap.favorite ? "text-yellow-400 fill-yellow-400" : "text-white"}
                        />
                      </motion.button>

                      {checkPermission(mindmap.connectedMemberPermissions, "DELETE") && (
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={(e) => handleDelete(e, mindmap)}
                          className="p-2 rounded-full hover:bg-white/20 transition-colors"
                        >
                          <Image src={deleteIcon} height={18} alt="delete" className="opacity-90" />
                        </motion.button>
                      )}
                    </motion.div>
                  </div>

                  <div className="p-6 space-y-4">
                    <motion.h3
                      className="font-semibold text-xl dark:text-white"
                      initial={false}
                      animate={{
                        color: hoveredId === mindmap.id ? "rgb(var(--primary-color))" : "",
                      }}
                    >
                      {mindmap.name}
                    </motion.h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{mindmap.description}</p>
                    <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 pt-2 border-t dark:border-slate-700">
                      <span className="flex items-center space-x-1">
                        <span>{text("createdBy")}</span>
                        <span className="text-primary-color font-medium">
                          {uppercaseFirstLetter(mindmap.creatorUsername)}
                        </span>
                      </span>
                      <span>{formatDate(mindmap.updatedAt, dateText)}</span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[500px] rounded-2xl border dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg p-12 relative overflow-hidden"
    >
      <motion.div
        className="absolute inset-0 -z-10"
        animate={{
          background: [
            "radial-gradient(circle at 50% 50%, rgba(77, 106, 255, 0.1) 0%, transparent 50%)",
            "radial-gradient(circle at 50% 50%, rgba(77, 106, 255, 0.2) 0%, transparent 70%)",
            "radial-gradient(circle at 50% 50%, rgba(77, 106, 255, 0.1) 0%, transparent 50%)",
          ],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
        className="relative w-32 h-32 mb-8"
      >
        <Image src={boardElement} alt="Empty" layout="fill" objectFit="contain" />
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-2xl font-semibold mb-4 dark:text-white"
      >
        Start Your First Mindmap
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center text-gray-600 dark:text-gray-400 mb-8 max-w-md"
      >
        Begin your creative journey by creating a new mindmap. Organize your thoughts, brainstorm ideas, and visualize
        connections.
      </motion.p>
    </motion.div>
  );
}

export { MindMapBoards };
