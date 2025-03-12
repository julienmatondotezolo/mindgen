/* eslint-disable no-unused-vars */
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Trash2, X } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { FC, useEffect, useRef, useState } from "react";

import { Organization } from "@/_types/Organization";
import { Button } from "@/components/ui";
import { uppercaseFirstLetter } from "@/utils";

interface OrgaDeleteConfirmDialogProps {
  open: boolean;
  setIsOpen: (open: boolean) => void;
  organization: Organization | undefined;
  onConfirmDelete: () => void;
}

const OrgaDeleteConfirmDialog: FC<OrgaDeleteConfirmDialogProps> = ({
  open,
  setIsOpen,
  organization,
  onConfirmDelete,
}) => {
  const text = useTranslations("Index");
  const textOrga = useTranslations("Organization");
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
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

  const handleRemove = async () => {
    if (confirmText !== organization?.name) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      return;
    }

    onConfirmDelete();
    setConfirmText("");
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
      transition: { duration: 0.5 },
    },
  };

  const progressValue = organization?.name ? (confirmText.length / organization.name.length) * 100 : 0;
  const isConfirmed = confirmText === organization?.name;

  if (!organization) return null;

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
                      scale: isConfirmed ? [1, 1.2, 1] : 1,
                    }}
                    transition={{ duration: 0.5 }}
                    className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full"
                  >
                    <Trash2 className="w-6 h-6 text-red-500" />
                  </motion.div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    {uppercaseFirstLetter(text("remove"))} {textOrga("organization")}
                  </h2>
                </motion.div>

                <motion.button
                  className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
                  onClick={handleClose}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="w-5 h-5 text-gray-500" />
                </motion.button>
              </div>

              <motion.div
                className="space-y-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-start space-x-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      {uppercaseFirstLetter(text("youre_about_to_delete"))}{" "}
                      <span className="font-bold">&quot;{organization.name}&quot;</span>.
                      <br />
                      <b>{text("this_action_cannot_be_undone")}</b>
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    {text("type_to_confirm")} <span className="font-semibold">&quot;{organization.name}&quot;</span>
                  </label>
                  <motion.div animate={isShaking ? "shake" : "idle"} variants={shakeAnimation}>
                    <input
                      ref={inputRef}
                      type="text"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 dark:bg-gray-800 dark:text-white"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      placeholder={organization.name}
                    />
                  </motion.div>
                </div>
              </motion.div>

              <motion.div
                className="flex justify-between"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Button
                  className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md"
                  onClick={handleClose}
                >
                  {uppercaseFirstLetter(text("cancel"))}
                </Button>
                <Button
                  disabled={!isConfirmed}
                  className={`px-4 py-2 rounded-md ${
                    isConfirmed
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "bg-gray-300 text-gray-500 dark:bg-gray-800 dark:text-gray-400 cursor-not-allowed"
                  }`}
                  onClick={handleRemove}
                >
                  {uppercaseFirstLetter(text("remove"))}
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export { OrgaDeleteConfirmDialog };
