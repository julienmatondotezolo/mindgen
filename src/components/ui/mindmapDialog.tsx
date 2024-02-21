/* eslint-disable jsx-a11y/label-has-associated-control */
import { useTranslations } from "next-intl";
import React, { FC, useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "react-query";

import { createMindmap } from "@/_services";
import { MindMapDialogProps } from "@/_types/MindMapDialogProps";
import { Button, Input, Textarea } from "@/components/ui";
import { emptyMindMapObject, uppercaseFirstLetter } from "@/utils";

const MindmapDialog: FC<MindMapDialogProps> = ({ open, setIsOpen }) => {
  const text = useTranslations("Index");
  const modalRef = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    setIsOpen(false);
  };

  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation(createMindmap, {
    mutationKey: "CREATE_MINDMAP",
  });

  // Initialize state for title and description
  const [inputTitle, setInputTitle] = useState("");
  const [inputDescription, setInputDescription] = useState("");

  // Update state when input changes
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputTitle(e.target.value);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputDescription(e.target.value);
  };

  const handleConfirm = async () => {
    const emptyMindmapObject = emptyMindMapObject(inputTitle, inputDescription);

    try {
      await mutateAsync(emptyMindmapObject, {
        onSuccess: () => {
          // Invalidate the query to cause a re-fetch
          queryClient.invalidateQueries("userMindmap");
        },
      });
      handleClose();
    } catch (error) {
      if (error instanceof Error) {
        console.error(`An error has occurred: ${error.message}`);
      }
    }

    setInputTitle("");
    setInputDescription("");
    handleClose();
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
      <p className="font-bold text-xl">{uppercaseFirstLetter(text("new"))} mind map</p>
      <article className="space-y-4">
        <section>
          <p className="text-grey dark:text-grey-blue text-sm mb-2">{text("name")}</p>
          <Input
            type="text"
            placeholder={`Mind map ${text("name").toLowerCase()}`}
            value={inputTitle}
            onChange={handleTitleChange}
          />
        </section>

        <section>
          <p className="text-grey dark:text-grey-blue text-sm mb-2">{text("description")}</p>
          <Textarea
            placeholder={`Mind map ${text("description").toLowerCase()}`}
            value={inputDescription}
            onChange={handleDescriptionChange}
          />
        </section>
        <div className="flex flex-wrap justify-between items-center">
          <article>
            <p className="font-semibold">{text("private")}</p>
            <p className="text-grey dark:text-grey-blue text-sm">{text("onlyViewable")}</p>
          </article>
          <label className="inline-flex items-center cursor-pointer">
            <input type="checkbox" value="" className="sr-only peer" />
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-primary-color rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-color"></div>
          </label>
        </div>
      </article>
      <div className="flex flex-wrap justify-end space-y-2 space-x-4 mt-4">
        <Button variant="outline" onClick={handleClose}>
          {uppercaseFirstLetter(text("cancel"))}
        </Button>
        <Button onClick={handleConfirm}>{uppercaseFirstLetter(text("create"))}</Button>
      </div>
    </div>
  );
};

export { MindmapDialog };
