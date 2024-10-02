/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { useTranslations } from "next-intl";
import React, { FC, useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import { useRecoilValue } from "recoil";

import { createMindmap } from "@/_services";
import { Organization } from "@/_types";
import { MindMapDialogProps } from "@/_types/MindMapDialogProps";
import { Button, Input, Switch, Textarea } from "@/components/ui";
import { selectedOrganizationState } from "@/state";
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
  const [inputVisibility, setInputVisibility] = useState("PUBLIC");

  // Update state when input changes
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputTitle(e.target.value);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputDescription(e.target.value);
  };

  const handleVisibilityChange = (checked: boolean) => {
    setInputVisibility(checked ? "PRIVATE" : "PUBLIC");
  };

  const selectedOrga = useRecoilValue<Organization | undefined>(selectedOrganizationState);

  const handleConfirm = async () => {
    const emptyMindmapObject = emptyMindMapObject({
      name: inputTitle,
      description: inputDescription,
      pictureUrl: "",
      organizationId: selectedOrga!.id,
      visibility: inputVisibility,
    });

    try {
      await mutateAsync(emptyMindmapObject, {
        onSuccess: async () => {
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
          <Switch checked={inputVisibility == "PRIVATE" ? true : false} onCheckedChange={handleVisibilityChange} />
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
