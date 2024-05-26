/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { FileDown, X } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { FC, useEffect, useRef, useState } from "react";
import { useReactFlow } from "reactflow";

import { DialogProps } from "@/_types";
import { exportMindmap, uppercaseFirstLetter } from "@/utils";

import { Button, Input } from ".";

const ShareDialog: FC<DialogProps> = ({ open, setIsOpen }) => {
  const text = useTranslations("Index");
  const modalRef = useRef<HTMLDivElement>(null);
  const { getEdges, getNodes } = useReactFlow();
  const [url, setUrl] = useState("");
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClose = () => {
    // setIsOpen(false);
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
        // Select the input content
        inputRef.current?.select();
        setIsButtonDisabled(true);
      })
      .catch((err) => {
        console.error("Failed to copy URL: ", err);
      });
  };

  const handleExport = () => {
    const edges = getEdges();
    const nodes = getNodes();

    exportMindmap(edges, nodes);
    setIsOpen(false);
  };

  return (
    <div
      ref={modalRef}
      className={`${
        open ? "block" : "hidden"
      } fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 sm:w-11/12 md:w-4/12 bg-white border-2 p-6 space-y-8 rounded-xl shadow-lg backdrop-filter backdrop-blur-lg dark:bg-slate-900 dark:bg-opacity-70 dark:shadow-slate-900 dark:border-slate-800`}
    >
      <article className="flex flex-wrap justify-between w-full">
        <p className="font-bold text-xl">{uppercaseFirstLetter(text("share"))} mind map</p>
        <X className="cursor-pointer" onClick={handleClose} />
      </article>
      <div className="w-full mt-4 space-y-6">
        <article className="w-full">
          <p className="text-sm font-bold">Share link</p>
          <p className="text-sm">
            Enable a secret link for collaborators and invite them to create awesome mind maps together.
          </p>
          <div className="relative">
            <Input value={url} ref={inputRef} className="mt-4" readOnly />
            <Button
              disabled={isButtonDisabled}
              onClick={handleCopyLink}
              className="absolute top-0 right-0 mt-[6px] mr-[6px] px-[20px] py-[4px] !opacity-100"
            >
              {isButtonDisabled ? <p>Copied</p> : <p>Copy</p>}
            </Button>
          </div>
        </article>
        <Button className="space-x-2" onClick={handleExport}>
          <FileDown />
          <p>{text("export")} mindmap</p>
        </Button>
      </div>
    </div>
  );
};

export { ShareDialog };
