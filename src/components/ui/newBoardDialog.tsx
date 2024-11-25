/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { BarChart, BrainCircuit, Cpu, LineChart, Sparkles, Workflow } from "lucide-react";
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

const DiagramBuilder = ({ diagramType, setDiagramType }: { diagramType: any; setDiagramType: any }) => {
  const handleDiagramTypeChange = (type: any) => {
    setDiagramType(type);
  };

  const diagramSelectorStyle =
    "flex items-center justify-center text-sm space-x-2 py-4 rounded-lg transition-colors duration-300";

  const size = 14;

  return (
    <div className="w-full space-y-6">
      <h2 className="font-bold text-xl">Select a diagram type</h2>
      <div className="grid grid-cols-3 gap-4">
        <button
          type="button"
          className={`${diagramSelectorStyle} ${
            diagramType === "Random Type" ? "bg-primary text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
          onClick={() => handleDiagramTypeChange("PYRAMID")}
        >
          <Sparkles size={size} />
          <span>Random Type</span>
        </button>
        <button
          type="button"
          className={`${diagramSelectorStyle} ${
            diagramType === "PYRAMID" ? "bg-primary text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
          onClick={() => handleDiagramTypeChange("PYRAMID")}
        >
          <Workflow size={size} />
          <span>Flow Chart</span>
        </button>
        <button
          type="button"
          className={`${diagramSelectorStyle} ${
            diagramType === "CIRCLE" ? "bg-primary text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
          onClick={() => handleDiagramTypeChange("CIRCLE")}
        >
          <BrainCircuit size={size} />
          <span>Mind Map</span>
        </button>
        <button
          type="button"
          className={`${diagramSelectorStyle} ${
            diagramType === "SWOT" ? "bg-primary text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
          onClick={() => handleDiagramTypeChange("PYRAMID")}
        >
          <Cpu size={size} />
          <span>SWOT</span>
        </button>
        <button
          type="button"
          className={`${diagramSelectorStyle} ${
            diagramType === "Bar Chart" ? "bg-primary text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
          onClick={() => handleDiagramTypeChange("PYRAMID")}
        >
          <BarChart size={size} />
          <span>Bar Chart</span>
        </button>
        <button
          type="button"
          className={`${diagramSelectorStyle} ${
            diagramType === "Line Chart" ? "bg-primary text-white" : "bg-gray-100 text-gray-700 hover:bg-gray -200"
          }`}
          onClick={() => handleDiagramTypeChange("PYRAMID")}
        >
          <LineChart size={size} />
          <span>Line Chart</span>
        </button>
      </div>
    </div>
  );
};

export default DiagramBuilder;

const NewBoardDialog: FC<MindMapDialogProps> = ({ open, setIsOpen }) => {
  const text = useTranslations("Index");
  const modalRef = useRef<HTMLFormElement>(null);
  const router = useRouter();
  const [diagramType, setDiagramType] = useState("CIRCLE");

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
  // const [inputTitle, setInputTitle] = useState("");
  const [inputDescription, setInputDescription] = useState("");
  const [inputVisibility, setInputVisibility] = useState("PUBLIC");

  // Update state when input changes
  // const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   setInputTitle(e.target.value);
  // };

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
        layoutType: diagramType,
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
      } fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 max-w-2xl w-[90%] bg-white border-2 p-6 space-y-8 rounded-xl shadow-lg backdrop-filter backdrop-blur-lg dark:bg-slate-900 dark:bg-opacity-70 dark:shadow-slate-900 dark:border-slate-800`}
    >
      <DiagramBuilder diagramType={diagramType} setDiagramType={setDiagramType} />
      <article className="space-y-4">
        <p className="font-bold text-xl">{uppercaseFirstLetter(text("new"))} board</p>
        {/* <section>
          <p className="text-grey dark:text-grey-blue text-sm mb-2">{text("name")}</p>
          <Input
            type="text"
            placeholder={`Board ${text("name").toLowerCase()}`}
            value={inputTitle}
            onChange={handleTitleChange}
            required
          />
        </section> */}

        <section>
          <p className="text-grey dark:text-grey-blue text-sm mb-2">Board {text("description").toLocaleLowerCase()}</p>
          <Textarea
            placeholder={`Board ${text("description").toLowerCase()}`}
            value={inputDescription}
            onChange={handleDescriptionChange}
            required
            disabled={fetchGenerateMindmap.isLoading}
          />
        </section>
      </article>
      <div className="flex flex-wrap justify-between items-center">
        <article>
          <p className="font-semibold">{text("private")}</p>
          <p className="text-grey dark:text-grey-blue text-sm">{text("onlyViewable")}</p>
        </article>
        <Switch
          checked={inputVisibility == "PRIVATE" ? true : false}
          onCheckedChange={handleVisibilityChange}
          disabled={fetchGenerateMindmap.isLoading}
        />
      </div>
      <div className="flex flex-wrap items-center justify-end space-x-4 mt-4">
        <Button variant="outline" onClick={handleClose}>
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

export { NewBoardDialog };
