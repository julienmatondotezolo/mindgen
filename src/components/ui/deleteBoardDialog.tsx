/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { FC, useEffect, useRef, useState } from "react";
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
  const [confirmText, setConfirmText] = useState("");
  const [isShaking, setIsShaking] = useState(false);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const handleClose = () => {
    setIsOpen(false);
    setConfirmText("");
  };

  const queryClient = useQueryClient();

  const fetchDeleteMindmapById = useMutation(deleteMindmapById, {
    mutationKey: "DELETE_MINDMAP",
    onSuccess: async () => {
      try {
        queryClient.invalidateQueries("userMindmap");
        setIsOpen(false);
        setConfirmText("");
      } catch (error) {
        if (error instanceof Error) {
          console.error(`An error has occurred: ${error.message}`);
        }
      }
    },
  });

  const handleRemove = async () => {
    if (confirmText !== boardToDelete.name) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    try {
      await fetchDeleteMindmapById.mutateAsync(boardToDelete.id);
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

  const shakeAnimation = {
    shake: {
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.5 }
    }
  };

  const progressValue = (confirmText.length / boardToDelete?.name.length) * 100;
  const isConfirmed = confirmText === boardToDelete?.name;

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
              <motion.div 
                className="absolute top-0 left-0 h-1 bg-red-500"
                initial={{ width: 0 }}
                animate={{ width: `${progressValue}%` }}
                transition={{ duration: 0.3 }}
              />
              
              <div className="p-6 space-y-6">
                <div className="flex justify-between items-center">
                  <motion.div
                    className="flex items-center space-x-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <motion.div
                      animate={{ 
                        rotate: isConfirmed ? [0, 360] : 0,
                        scale: isConfirmed ? [1, 1.2, 1] : 1
                      }}
                      transition={{ duration: 0.5 }}
                    >
                      <AlertTriangle className="w-6 h-6 text-red-500" />
                    </motion.div>
                    <h2 className="text-xl font-bold dark:text-white">
                      {text("remove")} {text("board")}?
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

                <motion.div
                  animate={isShaking ? "shake" : ""}
                  variants={shakeAnimation}
                  className="space-y-4"
                >
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {text("This action cannot be undone. Please type")} <span className="font-semibold text-red-500">{boardToDelete.name}</span> {text("to confirm")}:
                  </p>
                  
                  <input
                    ref={inputRef}
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    className="w-full px-4 py-2 text-sm border rounded-lg bg-transparent dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder={text("Type to confirm")}
                  />
                </motion.div>

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    className="px-4 py-2"
                    disabled={fetchDeleteMindmapById.isLoading}
                  >
                    {uppercaseFirstLetter(text("cancel"))}
                  </Button>
                  <motion.div
                    whileHover={isConfirmed ? { scale: 1.02 } : {}}
                    whileTap={isConfirmed ? { scale: 0.98 } : {}}
                  >
                    <Button
                      onClick={handleRemove}
                      className={`px-4 py-2 flex items-center space-x-2 ${isConfirmed ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-400'} transition-colors duration-300`}
                      disabled={!isConfirmed || fetchDeleteMindmapById.isLoading}
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>
                        {uppercaseFirstLetter(
                          fetchDeleteMindmapById.isLoading ? text("loading") + "..." : text("remove"),
                        )}
                      </span>
                    </Button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
};

export { DeleteBoardDialog };
