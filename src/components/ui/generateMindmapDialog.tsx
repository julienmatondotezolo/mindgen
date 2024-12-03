/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import React, { FC, useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import { useRecoilValue } from "recoil";

import { generatedMindmap } from "@/_services";
import { CustomSession, Organization } from "@/_types";
import { MindMapDialogProps } from "@/_types/MindMapDialogProps";
import { Button, Switch, Textarea } from "@/components/ui";
import { useRouter } from "@/navigation";
import { selectedOrganizationState } from "@/state";
import { uppercaseFirstLetter } from "@/utils";

const GenerateMindmapDialog: FC<MindMapDialogProps> = ({ open, setIsOpen }) => {
  const text = useTranslations("Index");
  const modalRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  const session: any = useSession();
  const safeSession = session ? (session as unknown as CustomSession) : null;

  const handleClose = () => {
    setIsOpen(false);
  };

  const queryClient = useQueryClient();
  const fetchGenerateMindmap = useMutation(generatedMindmap, {
    mutationKey: "GENERATE_MINDMAP",
    onSuccess: async (data: any) => {
      const response = await data;

      if (response.id !== "") {
        router.push(`/board/${data.id}`);
        // Invalidate the query to cause a re-fetch
        queryClient.invalidateQueries("userMindmap");
      }
    },
  });

  // Initialize state for title and description
  const [inputDescription, setInputDescription] = useState("");
  const [inputVisibility, setInputVisibility] = useState("PUBLIC");

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputDescription(e.target.value);
  };

  const handleVisibilityChange = (checked: boolean) => {
    setInputVisibility(checked ? "PRIVATE" : "PUBLIC");
  };

  const selectedOrga = useRecoilValue<Organization | undefined>(selectedOrganizationState);

  const handleConfirm = async (e: any) => {
    e.preventDefault();

    try {
      await fetchGenerateMindmap.mutateAsync({
        session: safeSession,
        organizationId: selectedOrga?.id,
        task: inputDescription,
        layoutType: "PYRAMID",
      });
      handleClose();
    } catch (error) {
      if (error instanceof Error) {
        console.error(`An error has occurred: ${error.message}`);
      }
    }

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
    <form
      ref={modalRef}
      onSubmit={handleConfirm}
      className={`${
        open ? "block" : "hidden"
      } fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 sm:w-11/12 md:w-4/12 bg-white border-2 p-6 space-y-8 rounded-xl shadow-lg backdrop-filter backdrop-blur-lg dark:bg-slate-900 dark:bg-opacity-70 dark:shadow-slate-900 dark:border-slate-800`}
    >
      <p className="font-bold text-xl">{uppercaseFirstLetter(text("generate"))} mind map</p>
      <article className="space-y-4">
        <section>
          <p className="text-grey dark:text-grey-blue text-sm mb-2">Mind map {text("description")}</p>
          <Textarea
            placeholder={`Mind map ${text("description").toLowerCase()}`}
            value={inputDescription}
            onChange={handleDescriptionChange}
            required
            disabled={fetchGenerateMindmap.isLoading}
          />
        </section>
        <div className="flex flex-wrap justify-between items-center">
          <article>
            <p className="font-semibold">{text("private")}</p>
            <p className="text-grey dark:text-grey-blue text-sm">{text("onlyViewable")}</p>
          </article>
          <Switch
            checked={inputVisibility == "PRIVATE" ? true : false}
            disabled={fetchGenerateMindmap.isLoading}
            onCheckedChange={handleVisibilityChange}
          />
        </div>
      </article>
      <div className="flex flex-wrap items-center justify-end space-x-4 mt-4">
        <Button variant="outline" onClick={handleClose} disabled={fetchGenerateMindmap.isLoading}>
          {uppercaseFirstLetter(text("cancel"))}
        </Button>
        <Button type="submit" disabled={fetchGenerateMindmap.isLoading}>
          <Sparkles className={fetchGenerateMindmap.isLoading ? "animate-spin" : ""} height={15} />
          {uppercaseFirstLetter(fetchGenerateMindmap.isLoading ? text("generating") + "..." : text("generate"))}
        </Button>
      </div>
    </form>
  );
};

export { GenerateMindmapDialog };
