/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { AnimatePresence, motion } from "framer-motion";
import { Trash2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { FC, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "react-query";
import { useRecoilValue } from "recoil";

import { deleteMindmapById } from "@/_services";
import { MindMapDialogProps } from "@/_types/MindMapDialogProps";
import { Button } from "@/components/ui";
import { boardToDeleteState } from "@/state";
import { uppercaseFirstLetter } from "@/utils";

const DeleteBoardDialog: FC<MindMapDialogProps> = ({ open, setIsOpen }) => {
  const text = useTranslations("Index");
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const boardToDelete = useRecoilValue(boardToDeleteState);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const handleClose = () => {
    setIsOpen(false);
  };

  const queryClient = useQueryClient();

  const fetchDeleteMindmapById = useMutation(deleteMindmapById, {
    mutationKey: "DELETE_MINDMAP",
    onSuccess: async () => {
      try {
        queryClient.invalidateQueries("userMindmap");
        setIsOpen(false);
      } catch (error) {
        if (error instanceof Error) {
          console.error(`An error has occurred: ${error.message}`);
        }
      }

      setIsOpen(false);
    },
  });

  const handleRemove = async () => {
    const mindMapId = boardToDelete.id;

    try {
      await fetchDeleteMindmapById.mutateAsync(mindMapId);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`An error has occurred: ${error.message}`);
      }
    }
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { type: "spring", duration: 0.5 } },
    exit: { scale: 0.8, opacity: 0 },
  };

  const stepVariants = {
    enter: { x: 50, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -50, opacity: 0 },
  };

  if (boardToDelete)
    return (
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={overlayVariants}
          >
            <motion.div
              ref={modalRef}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden"
              variants={modalVariants}
            >
              <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                  <motion.div
                    className="flex items-center space-x-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Trash2 className="w-6 h-6 text-primary-color" />
                    <h2 className="text-xl font-bold dark:text-white">
                      {`${uppercaseFirstLetter(text("remove"))} board ?`}
                    </h2>
                  </motion.div>
                  <motion.button
                    whileHover={{ rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleClose}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    <X className="w-5 h-5" />
                  </motion.button>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    initial="enter"
                    animate="center"
                    exit="exit"
                    variants={stepVariants}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <div className="space-y-4">
                      <motion.p
                        className="text-sm text-gray-500 dark:text-gray-400"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        {`You're about to remove the board: ${boardToDelete.name}.`}
                      </motion.p>
                    </div>
                  </motion.div>
                </AnimatePresence>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    className="px-4 py-2"
                    disabled={fetchDeleteMindmapById.isLoading}
                  >
                    {uppercaseFirstLetter(text("cancel"))}
                  </Button>
                  <Button
                    onClick={handleRemove}
                    className="px-4 py-2 flex items-center space-x-2 bg-red-500"
                    disabled={fetchDeleteMindmapById.isLoading}
                  >
                    <span>{uppercaseFirstLetter(text("remove"))}</span>
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
};

export { DeleteBoardDialog };
