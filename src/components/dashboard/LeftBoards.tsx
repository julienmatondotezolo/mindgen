import { Presentation, Sparkles } from "lucide-react";
import React from "react";
import { useRecoilValue } from "recoil";
import { motion } from "framer-motion";

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
      className="w-full p-6 rounded-2xl bg-gradient-to-r from-primary-color/5 to-secondary-color/5 dark:from-slate-800/50 dark:to-slate-700/50 backdrop-blur-sm border border-primary-color/10 dark:border-slate-700/50"
    >
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <motion.article 
            className="flex items-center space-x-3"
            initial={{ x: -20 }}
            animate={{ x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="p-2 rounded-lg bg-primary-color/10 dark:bg-slate-700/50">
              <Presentation className="text-primary-color dark:text-white" size={18} />
            </div>
            <div>
              <p className="font-bold text-sm text-foreground dark:text-white">
                {leftBoards} boards remaining
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {boardLength} of {maxMindmap} boards used
              </p>
            </div>
          </motion.article>
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
            className="flex items-center space-x-1"
          >
            <Sparkles className="text-primary-color" size={14} />
            <span className="text-xs font-medium text-primary-color">
              {Math.round(progressPercentage)}% Used
            </span>
          </motion.div>
        </div>

        <motion.div 
          className="h-2 w-full bg-gray-100 dark:bg-slate-700/50 rounded-full overflow-hidden"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ delay: 0.6 }}
        >
          <motion.div
            className="h-full bg-gradient-to-r from-primary-color to-secondary-color"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ delay: 0.8, duration: 0.8 }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

export { LeftBoards };
