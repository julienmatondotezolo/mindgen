import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import React from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import { Link } from "@/navigation";
import { boardsLengthState, newBoardState, profilMaxMindmapState } from "@/state";
import { uppercaseFirstLetter } from "@/utils";

import { Button } from "../ui";
import { MindMapBoards } from "./MindMapBoards";

function RecentMindMap() {
  const text = useTranslations("Index");
  const dashboardText = useTranslations("Dashboard");
  const [isOpen, setIsOpen] = useRecoilState(newBoardState);
  const maxMindmap = useRecoilValue(profilMaxMindmapState);
  const boardLength = useRecoilValue(boardsLengthState);
  const leftBoards = maxMindmap - boardLength;

  const searchParams = useSearchParams();
  const showUserBoards = searchParams.get("userBoards") === "true";

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
          <div className="flex space-x-8">
            <Link href="/dashboard">
              <Button variant={showUserBoards ? "ghost" : "boardClicked"}>
                <motion.article
                  variants={filterVariants}
                  initial="initial"
                  whileHover="hover"
                  className={"transition-all duration-300"}
                >
                  <p className="text-sm font-medium">{dashboardText("recentlyViewed")}</p>
                </motion.article>
              </Button>
            </Link>
            <Link href={{ pathname: "/dashboard", query: { userBoards: "true" } }}>
              <Button variant={showUserBoards ? "boardClicked" : "ghost"}>
                <motion.article
                  variants={filterVariants}
                  initial="initial"
                  whileHover="hover"
                  className={"transition-all duration-300"}
                >
                  <p className="text-sm font-medium">{dashboardText("myBoards")}</p>
                </motion.article>
              </Button>
            </Link>
          </div>
        </section>
        <section className="flex items-center space-x-4">
          <motion.div variants={buttonVariants} initial="initial" whileHover="hover" whileTap="tap">
            <Button onClick={handleNewBoard} className="bg-primary-color hover:opacity-90 transition-all duration-300">
              <Plus className="mr-2" height={size} />
              <span className="font-medium">
                {uppercaseFirstLetter(text("new"))} {dashboardText("board")}
              </span>
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
