/* eslint-disable jsx-a11y/label-has-associated-control */
import { useTranslations } from "next-intl";
import React, { FC, useEffect, useState } from "react";
import { useMutation, useQueryClient } from "react-query";

import { createMindmap } from "@/_services";
import { MindMapDialogProps } from "@/_types/MindMapDialogProps";
import { Button, Input, Textarea } from "@/components/ui";
import { emptyMindMapObject } from "@/utils";

const MindmapDialog: FC<MindMapDialogProps> = ({ title, description, open, setIsOpen }) => {
  const text = useTranslations("Index");
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

  useEffect(() => {
    if (title) setInputTitle(title);
    if (description) setInputDescription(description);
  }, [title, description]);

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

  return (
    <div className={`fixed inset-0 items-center justify-center z-50 dialog ${open ? "flex" : "hidden"}`}>
      <div className="max-w-full sm:w-4/12 bg-white border-2 p-6 space-y-8 rounded-xl shadow-lg backdrop-filter backdrop-blur-lg dark:bg-slate-900 dark:bg-opacity-70 dark:shadow-slate-900 dark:border-slate-800">
        <p className="font-bold text-xl">New mindmap</p>
        <article className="space-y-4">
          <section>
            <p className="text-grey dark:text-grey-blue text-sm mb-2">Name</p>
            <Input type="text" placeholder="Mindmap name" value={inputTitle} onChange={handleTitleChange} />
          </section>

          <section>
            <p className="text-grey dark:text-grey-blue text-sm mb-2">Description</p>
            <Textarea placeholder="mindmap description" value={inputDescription} onChange={handleDescriptionChange} />
          </section>
          <div className="flex flex-wrap justify-between items-center">
            <article>
              <p className="font-semibold">Private</p>
              <p className="text-grey dark:text-grey-blue text-sm">Only viewable by you</p>
            </article>
            <label className="inline-flex items-center cursor-pointer">
              <input type="checkbox" value="" className="sr-only peer" />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-primary-color rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-color"></div>
            </label>
          </div>
        </article>
        <div className="space-x-4 mt-4">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Create mindmap</Button>
        </div>
      </div>
    </div>
  );
};

export { MindmapDialog };
