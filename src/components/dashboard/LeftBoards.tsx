import { motion } from "framer-motion";
import { Presentation, Sparkles, Zap } from "lucide-react";
import React from "react";
import { useRecoilValue } from "recoil";

import { boardsLengthState, profilMaxMindmapState } from "@/state";

function LeftBoards() {
  const maxMindmap = useRecoilValue(profilMaxMindmapState);
  const boardLength = useRecoilValue(boardsLengthState);
  const leftBoards = maxMindmap - boardLength;

  const progressPercentage = (boardLength / maxMindmap) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full p-8 rounded-3xl bg-gradient-to-r from-primary-color/10 to-secondary-color/10 dark:from-slate-800/50 dark:to-slate-700/50 backdrop-blur-lg border-2 border-primary-color/10 dark:border-slate-700/50 shadow-[0_8px_24px_rgba(77,106,255,0.1)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_32px_rgba(77,106,255,0.15)] dark:hover:shadow-[0_12px_32px_rgba(0,0,0,0.4)] transition-all duration-500"
    >
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <motion.article
            className="flex items-center space-x-4"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <motion.div
              className="p-3 rounded-xl bg-gradient-to-br from-primary-color/10 to-secondary-color/10 dark:from-slate-700/50 dark:to-slate-600/50 shadow-inner"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Presentation className="text-primary-color dark:text-white" size={20} />
            </motion.div>
            <div>
              <p className="font-bold text-lg text-foreground dark:text-white flex items-center gap-2">
                {leftBoards} boards remaining
                <motion.span
                  className="text-xs px-2 py-1 rounded-full bg-primary-color/10 text-primary-color dark:bg-slate-700/50 dark:text-white"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {maxMindmap} total
                </motion.span>
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                You've used {boardLength} boards so far
              </p>
            </div>
          </motion.article>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className="flex items-center space-x-2 bg-gradient-to-r from-primary-color/10 to-secondary-color/10 dark:from-slate-700/50 dark:to-slate-600/50 px-3 py-2 rounded-xl"
          >
            <Zap className="text-primary-color animate-pulse" size={16} />
            <span className="text-sm font-medium text-primary-color">
              {Math.round(progressPercentage)}% Used
            </span>
          </motion.div>
        </div>

        <div className="relative h-3 w-full bg-gray-100/50 dark:bg-slate-700/30 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-color to-secondary-color relative"
            style={{ width: `${progressPercentage}%` }}
          >
            <motion.div
              className="absolute right-0 top-0 h-full w-1 bg-white/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 1.2 }}
            />
          </div>
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-primary-color/20 to-secondary-color/20 blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          />
        </div>
      </div>
    </motion.div>
  );
}

export { LeftBoards };
