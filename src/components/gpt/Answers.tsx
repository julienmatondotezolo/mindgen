import { motion } from "framer-motion";
import { Bot, MessageSquare } from "lucide-react";
import React from "react";
import { useRecoilValue } from "recoil";

import { RenderMarkdown, SkeletonAnswerText } from "@/components/gpt";
import { qaState } from "@/state";

function Answers() {
  const qa = useRecoilValue(qaState);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: {
      opacity: 0,
      y: 10,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      className="w-full max-w-[60%] mx-auto px-4 my-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {qa.map((qaItem, index) => (
        <motion.div key={index} variants={itemVariants} className="mb-8">
          {/* User Message */}
          <div className="flex items-start justify-end mb-8">
            <div className="max-w-[80%] flex items-start gap-4">
              <div className="flex-1">
                <div className="bg-primary-color text-white rounded-2xl rounded-tr-none px-6 py-4 shadow-md">
                  <p className="text-white/95">{qaItem.text}</p>
                </div>
              </div>
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-color flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>

          {/* AI Response */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
              <Bot className="w-4 h-4 text-slate-700 dark:text-slate-200" />
            </div>
            <div className="flex-1">
              <div className="prose prose-slate dark:prose-invert max-w-none bg-white dark:bg-slate-800 rounded-2xl rounded-tl-none px-6 py-4 shadow-sm">
                {qaItem.message ? (
                  <RenderMarkdown markdownText={qaItem.message} />
                ) : (
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4">
                    <SkeletonAnswerText />
                  </div>
                )}
              </div>
            </div>
          </div>

          {index < qa.length - 1 && <div className="w-full h-px bg-slate-200 dark:bg-slate-700 my-8" />}
        </motion.div>
      ))}
    </motion.div>
  );
}

export { Answers };
