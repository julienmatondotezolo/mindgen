/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { FileDown, X, Share2, Link, Download } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { FC, useEffect, useRef, useState } from "react";
import { useQuery } from "react-query";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { motion, AnimatePresence } from "framer-motion";

import { CanvasMode, DialogProps, ProfileProps } from "@/_types";
import { canvasStateAtom, edgesAtomState, layerAtomState, upgradePlanModalState } from "@/state";
import { exportMindmap, uppercaseFirstLetter } from "@/utils";

import { Button, Input } from ".";

const ShareDialog: FC<DialogProps> = ({ open, setIsOpen }) => {
  const text = useTranslations("Index");
  const modalRef = useRef<HTMLDivElement>(null);
  const [url, setUrl] = useState("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState('share');

  const setCanvasState = useSetRecoilState(canvasStateAtom);
  const [upgradePlanModal, setUpgradePlanModal] = useRecoilState(upgradePlanModalState);

  const handleUpgratePlanClick = () => {
    setUpgradePlanModal(!upgradePlanModal);
  };

  const layers = useRecoilValue(layerAtomState);
  const edges = useRecoilValue(edgesAtomState);

  const { data: userProfile } = useQuery<ProfileProps>("userProfile");

  const handleClose = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!modalRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setUrl(window.location.href);
  }, []);

  const handleCopyLink = () => {
    setUrl(window.location.href);
    navigator.clipboard
      .writeText(url)
      .then(() => {
        inputRef.current?.select();
        setIsButtonDisabled(true);
        setTimeout(() => setIsButtonDisabled(false), 2000);
      })
      .catch((err) => {
        console.error("Failed to copy URL: ", err);
      });
  };

  const handleExport = async (e: any) => {
    e.preventDefault();

    if (userProfile?.plan == "FREE") {
      setIsOpen(false);
      handleUpgratePlanClick();
      return;
    }

    setCanvasState({ mode: CanvasMode.Exporting });

    try {
      await exportMindmap(edges, layers);
    } catch (error) {
      console.error("error:", error);
    }
    setIsOpen(false);
  };

  const TabButton = ({ id, icon: Icon, label }: { id: string; icon: any; label: string }) => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => setActiveTab(id)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
        activeTab === id 
          ? 'bg-primary text-white' 
          : 'hover:bg-gray-100 dark:hover:bg-slate-800'
      }`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </motion.button>
  );

  return (
    <div
      ref={modalRef}
      className={`${
        open ? "block" : "hidden"
      } fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-[95vw] max-w-[500px] bg-white border p-6 rounded-xl shadow-lg backdrop-filter backdrop-blur-lg dark:bg-slate-900 dark:bg-opacity-70 dark:shadow-slate-900 dark:border-slate-800`}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2"
          >
            <Share2 className="text-primary" size={24} />
            <h2 className="text-xl font-bold">{uppercaseFirstLetter(text("share"))} mind map</h2>
          </motion.div>
          <motion.button
            whileHover={{ rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={20} />
          </motion.button>
        </div>

        <div className="flex space-x-4 border-b dark:border-slate-700">
          <TabButton id="share" icon={Link} label="Share Link" />
          {layers?.length > 0 && (
            <TabButton id="export" icon={Download} label="Export" />
          )}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'share' ? (
            <motion.div
              key="share"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <h3 className="font-medium">Share with collaborators</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Invite others to view and collaborate on your mind map in real-time
                </p>
              </div>
              
              <div className="relative">
                <Input 
                  value={url} 
                  ref={inputRef} 
                  className="pr-24 bg-gray-50 dark:bg-slate-800" 
                  readOnly 
                />
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="absolute right-1 top-1"
                >
                  <Button
                    disabled={isButtonDisabled}
                    onClick={handleCopyLink}
                    className="px-4 py-1"
                  >
                    {isButtonDisabled ? "Copied!" : "Copy"}
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="export"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <h3 className="font-medium">Export your mind map</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Save your mind map to your computer
                </p>
              </div>
              
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  onClick={handleExport}
                  className="w-full flex items-center justify-center space-x-2"
                >
                  <FileDown size={18} />
                  <span>{text("export")} mindmap</span>
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export { ShareDialog };
