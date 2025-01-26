/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { AnimatePresence, motion } from "framer-motion";
import { AlignJustify, LayoutGrid, Plus } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import { Filter } from "@/_types";
import { Link } from "@/navigation";
import { boardsLengthState, globalFilterState, newBoardState, profilMaxMindmapState } from "@/state";
import { uppercaseFirstLetter } from "@/utils";

import { Button } from "../ui";
import { MindMapBoards } from "./MindMapBoards";

function RecentMindMap() {
  const text = useTranslations("Index");
  const [isOpen, setIsOpen] = useRecoilState(newBoardState);
  const maxMindmap = useRecoilValue(profilMaxMindmapState);
  const boardLength = useRecoilValue(boardsLengthState);
  const leftBoards = maxMindmap - boardLength;
  const [hoveredFilter, setHoveredFilter] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const showFavorites = searchParams.get("usermindmaps") === "true";

  const canCreateNewBoard = leftBoards > 0;

  const handleNewBoard = () => {
    if (canCreateNewBoard) {
      setIsOpen(!isOpen);
      return;
    }

    alert("Upgrade required! Upgrade to create unlimited boards for you and your clients");
  };

  const size = 15;

  const filterVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05, transition: { duration: 0.2 } },
  };

  const buttonVariants = {
    initial: { scale: 1 },
    hover: {
      scale: 1.03,
      boxShadow: "0 4px 15px rgba(77, 106, 255, 0.2)",
      transition: { duration: 0.2 },
    },
    tap: { scale: 0.98 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="pb-16"
    >
      <div className="w-full flex justify-between items-center mb-8">
        <section className="grid grid-cols-2 gap-8">
          <div className="flex space-x-3">
            <Link href="/dashboard">
              <motion.article
                variants={filterVariants}
                initial="initial"
                whileHover="hover"
                className={`${
                  !showFavorites
                    ? "bg-gradient-to-r from-primary-color/10 to-secondary-color/10 dark:from-primary-color/20 dark:to-secondary-color/20"
                    : ""
                } rounded-xl px-4 py-2 transition-all duration-300`}
              >
                <p className="text-sm font-medium">Recently viewed</p>
              </motion.article>
            </Link>
            <Link href={{ pathname: "/dashboard", query: { usermindmaps: "true" } }}>
              <motion.article
                variants={filterVariants}
                initial="initial"
                whileHover="hover"
                className={`${
                  showFavorites
                    ? "bg-gradient-to-r from-primary-color/10 to-secondary-color/10 dark:from-primary-color/20 dark:to-secondary-color/20"
                    : ""
                } rounded-xl px-4 py-2 transition-all duration-300`}
              >
                <p className="text-sm font-medium">My mindmaps</p>
              </motion.article>
            </Link>
          </div>
        </section>
        <section className="flex items-center space-x-4">
          <motion.div variants={buttonVariants} initial="initial" whileHover="hover" whileTap="tap">
            <Button onClick={handleNewBoard} className="bg-primary-color hover:opacity-90 transition-all duration-300">
              <Plus className="mr-2" height={size} />
              <span className="font-medium">{uppercaseFirstLetter(text("new"))} board</span>
            </Button>
          </motion.div>
        </section>
      </div>
      <AnimatePresence mode="wait">
        <motion.article
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          <MindMapBoards />
        </motion.article>
      </AnimatePresence>
    </motion.div>
  );
}

export { RecentMindMap };
