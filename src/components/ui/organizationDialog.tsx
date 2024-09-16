/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { useTranslations } from "next-intl";
import React, { FC, useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "react-query";

import { createOrganization } from "@/_services";
import { MindMapDialogProps } from "@/_types/MindMapDialogProps";
import { Button, Input } from "@/components/ui";
import { uppercaseFirstLetter } from "@/utils";

const OrganizationDialog: FC<MindMapDialogProps> = ({ open, setIsOpen }) => {
  const text = useTranslations("Index");
  const textOrga = useTranslations("Organization");
  const modalRef = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    setIsOpen(false);
  };

  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation(createOrganization, {
    mutationKey: "CREATE_ORGANIZATION",
  });

  // Initialize state for title and description
  const [inputTitle, setInputTitle] = useState("");

  // Update state when input changes
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputTitle(e.target.value);
  };

  const handleConfirm = async () => {
    const organizationObject = {
      name: inputTitle,
      type: "PERSONAL",
    };

    try {
      await mutateAsync(organizationObject, {
        onSuccess: () => {
          // Invalidate the query to cause a re-fetch
          queryClient.invalidateQueries("userOrganizations");
        },
      });
      handleClose();
    } catch (error) {
      if (error instanceof Error) {
        console.error(`An error has occurred: ${error.message}`);
      }
    }

    setInputTitle("");
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
      <p className="font-bold text-xl">{`${uppercaseFirstLetter(text("create"))} ${textOrga("organization")}`}</p>
      <article className="space-y-4">
        <section>
          <p className="text-grey dark:text-grey-blue text-sm mb-2">{text("name")}</p>
          <Input
            type="text"
            placeholder={`${uppercaseFirstLetter(textOrga("organization"))} ${text("name").toLowerCase()}`}
            value={inputTitle}
            onChange={handleTitleChange}
          />
        </section>
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

export { OrganizationDialog };
