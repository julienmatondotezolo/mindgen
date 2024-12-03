/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import React, { FC, useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import { useSetRecoilState } from "recoil";
import { Building2, X, Sparkles, ArrowRight } from "lucide-react";

import { createOrganization } from "@/_services";
import { Organization } from "@/_types";
import { MindMapDialogProps } from "@/_types/MindMapDialogProps";
import { Button, Input } from "@/components/ui";
import { selectedOrganizationState } from "@/state";
import { uppercaseFirstLetter } from "@/utils";

const OrganizationDialog: FC<MindMapDialogProps> = ({ open, setIsOpen }) => {
  const text = useTranslations("Index");
  const textOrga = useTranslations("Organization");
  const modalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputTitle, setInputTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  const setSelectedOrganization = useSetRecoilState<Organization | undefined>(selectedOrganizationState);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const handleClose = () => {
    setIsOpen(false);
    setStep(1);
    setInputTitle("");
  };

  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation(createOrganization, {
    mutationKey: "CREATE_ORGANIZATION",
  });

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputTitle(e.target.value);
  };

  const handleConfirm = async () => {
    if (!inputTitle.trim()) return;
    
    setIsLoading(true);
    const organizationObject = {
      name: inputTitle,
      type: "PERSONAL",
    };

    try {
      await mutateAsync(organizationObject, {
        onSuccess: (newOrga) => {
          setSelectedOrganization(newOrga);
          queryClient.invalidateQueries("userOrganizations");
        },
      });
      handleClose();
    } catch (error) {
      if (error instanceof Error) {
        console.error(`An error has occurred: ${error.message}`);
      }
    } finally {
      setIsLoading(false);
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
                  <Building2 className="w-6 h-6 text-primary-color" />
                  <h2 className="text-xl font-bold dark:text-white">
                    {`${uppercaseFirstLetter(text("create"))} ${textOrga("organization")}`}
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
                  key={step}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  variants={stepVariants}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                >
                  {step === 1 ? (
                    <div className="space-y-4">
                      <Input
                        ref={inputRef}
                        type="text"
                        placeholder={`${uppercaseFirstLetter(textOrga("organization"))} ${text("name").toLowerCase()}`}
                        value={inputTitle}
                        onChange={handleTitleChange}
                        className="w-full transition-all duration-200 focus:ring-2 focus:ring-primary-color"
                      />
                      <motion.p 
                        className="text-sm text-gray-500 dark:text-gray-400"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                      >
                        Create your organization to start collaborating with your team
                      </motion.p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-primary-color/10 rounded-lg">
                        <p className="text-primary-color font-medium">Organization Details</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">{inputTitle}</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="px-4 py-2"
                  disabled={isLoading}
                >
                  {uppercaseFirstLetter(text("cancel"))}
                </Button>
                <Button
                  onClick={step === 1 ? () => setStep(2) : handleConfirm}
                  className="px-4 py-2 flex items-center space-x-2"
                  disabled={!inputTitle.trim() || isLoading}
                >
                  {isLoading ? (
                    <Sparkles className="animate-spin mr-2" />
                  ) : (
                    <>
                      <span>{step === 1 ? 'Next' : uppercaseFirstLetter(text("create"))}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>

            <motion.div
              className="absolute inset-x-0 bottom-0 h-1 bg-primary-color"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: step === 2 ? 1 : 0.5 }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export { OrganizationDialog };
