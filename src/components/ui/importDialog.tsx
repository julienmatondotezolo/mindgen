/* eslint-disable jsx-a11y/label-has-associated-control */
import { useTranslations } from "next-intl";
import React, { FC, useEffect, useRef } from "react";

import { MindMapDialogProps } from "@/_types/MindMapDialogProps";
import { uppercaseFirstLetter } from "@/utils";

import { Button } from ".";

const ImportDialog: FC<MindMapDialogProps> = ({ open, setIsOpen }) => {
  const text = useTranslations("Index");
  const modalRef = useRef<HTMLDivElement>(null);

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

  return (
    <div
      ref={modalRef}
      className={`${
        open ? "block" : "hidden"
      } fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 sm:w-11/12 md:w-4/12 bg-white border-2 p-6 space-y-8 rounded-xl shadow-lg backdrop-filter backdrop-blur-lg dark:bg-slate-900 dark:bg-opacity-70 dark:shadow-slate-900 dark:border-slate-800`}
    >
      <p className="font-bold text-xl">{uppercaseFirstLetter(text("import"))} mind map</p>
      <div className="flex flex-wrap justify-end space-y-2 space-x-4 mt-4">
        <Button variant="outline" onClick={handleClose}>
          {uppercaseFirstLetter(text("cancel"))}
        </Button>
        {/* <Button onClick={handleConfirm}>{uppercaseFirstLetter(text("create"))}</Button> */}
      </div>
    </div>
  );
};

export { ImportDialog };
