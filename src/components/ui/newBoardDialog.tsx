/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart,
  BrainCircuit,
  CircleDot,
  Cpu,
  Globe,
  LineChart,
  Lock,
  Network,
  Plus,
  Sparkles,
  Workflow,
  X,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import React, { FC, useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import { useRecoilValue } from "recoil";

import { createMindmap, generatedMindmap } from "@/_services";
import { CustomSession, Organization } from "@/_types";
import { MindMapDialogProps } from "@/_types/MindMapDialogProps";
import { Button, Input, Switch, Textarea } from "@/components/ui";
import { useRouter } from "@/navigation";
import { selectedOrganizationState } from "@/state";
import { emptyMindMapObject, uppercaseFirstLetter } from "@/utils";

const DiagramOption = ({
  icon: Icon,
  title,
  isSelected,
  onClick,
  description,
  disabled,
}: {
  icon: any;
  title: string;
  isSelected: boolean;
  onClick: () => void;
  description: string;
  disabled?: boolean;
}) => (
  <motion.button
    whileHover={{ scale: disabled ? 1 : 1.02 }}
    whileTap={{ scale: disabled ? 1 : 0.98 }}
    onClick={disabled ? undefined : onClick}
    className={`relative w-full p-4 rounded-xl transition-all duration-300 ${
      isSelected
        ? "bg-primary text-white shadow-lg shadow-primary/25"
        : "bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700"
    } ${disabled ? " opacity-40 cursor-not-allowed" : ""}`}
  >
    <motion.div
      initial={false}
      animate={{
        scale: isSelected ? 1 : 0.9,
        opacity: isSelected ? 1 : 0.7,
      }}
      className="flex flex-col items-center space-y-2"
    >
      <div className="flex items-center space-x-2">
        <Icon size={18} className={isSelected ? "text-white" : "text-primary"} />
        <span className="font-medium">{title}</span>
      </div>
      <p className="text-xs opacity-75">{description}</p>
    </motion.div>
    {isSelected && (
      <motion.div
        layoutId="selectedBorder"
        className="absolute inset-0 border-2 border-primary rounded-xl"
        initial={false}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
    )}
  </motion.button>
);

const LayoutOption = ({
  icon: Icon,
  title,
  isSelected,
  onClick,
}: {
  icon: any;
  title: string;
  isSelected: boolean;
  onClick: () => void;
}) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
      isSelected ? "bg-primary text-white" : "bg-gray-50 hover:bg-gray-100 dark:bg-slate-800 dark:hover:bg-slate-700"
    }`}
  >
    <Icon size={18} />
    <span>{title}</span>
  </motion.button>
);

const NewBoardDialog: FC<MindMapDialogProps> = ({ open, setIsOpen }) => {
  const text = useTranslations("Index");
  const modalRef = useRef<HTMLFormElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();
  const [selectedType, setSelectedType] = useState("MIND_MAP");
  const [layoutType, setLayoutType] = useState("CIRCLE");
  const [inputTitle, setInputTitle] = useState("");
  const [inputDescription, setInputDescription] = useState("");
  const [inputVisibility, setInputVisibility] = useState("PUBLIC");

  const session: any = useSession();
  const safeSession = session ? (session as unknown as CustomSession) : null;
  const selectedOrga = useRecoilValue<Organization | undefined>(selectedOrganizationState);

  const diagramOptions = [
    {
      id: "BLANK",
      icon: Plus,
      title: "Blank board",
      description: "Create a board from scratch",
      disabled: false,
    },
    {
      id: "MIND_MAP",
      icon: BrainCircuit,
      title: "Mind Map",
      description: "Organize ideas hierarchically",
      disabled: false,
    },
    {
      id: "FLOW_CHART",
      icon: Workflow,
      title: "Flow Chart",
      description: "Visualize processes and workflows",
      disabled: true,
    },
    { id: "SWOT", icon: Cpu, title: "SWOT", description: "Analyze strengths and weaknesses", disabled: true },
    { id: "BAR", icon: BarChart, title: "Bar Chart", description: "Compare data categories", disabled: true },
    { id: "LINE", icon: LineChart, title: "Line Chart", description: "Track trends over time", disabled: true },
  ];

  const layoutOptions = [
    { id: "CIRCLE", icon: CircleDot, title: "Radial Layout" },
    { id: "PYRAMID", icon: Network, title: "Hierarchical Layout" },
  ];

  const handleClose = () => {
    setInputTitle("");
    setInputVisibility("PUBLIC");
    setInputDescription("");
    setIsOpen(false);
  };

  const queryClient = useQueryClient();
  const fetchGenerateMindmap = useMutation(generatedMindmap, {
    mutationKey: "GENERATE_MINDMAP",
    onSuccess: async (data: any) => {
      const response = await data;

      if (response.id !== "") {
        router.push(`/board/${data.id}`);
        queryClient.invalidateQueries("userMindmap");
      }
    },
  });

  const fetchCreateMindmap = useMutation(createMindmap, {
    mutationKey: "CREATE_MINDMAP",
    onSuccess: async (data: any) => {
      const response = await data;

      if (response.id !== "") {
        router.push(`/board/${data.id}`);
        // Invalidate the query to cause a re-fetch
        queryClient.invalidateQueries("userMindmap");
      }
    },
  });

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputTitle(e.target.value);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputDescription(e.target.value);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (selectedType !== "BLANK") {
      try {
        await fetchGenerateMindmap.mutateAsync({
          session: safeSession,
          organizationId: selectedOrga?.id,
          task: inputDescription,
          layoutType,
        });
        handleClose();
      } catch (error) {
        if (error instanceof Error) {
          console.error(`An error has occurred: ${error.message}`);
        }
      }
    } else {
      const emptyMindmapObject = emptyMindMapObject({
        name: inputTitle,
        description: inputDescription,
        pictureUrl: "",
        organizationId: selectedOrga!.id,
        visibility: inputVisibility,
      });

      try {
        fetchCreateMindmap.mutate({ mindmapObject: emptyMindmapObject });
        handleClose();
      } catch (error) {
        if (error instanceof Error) {
          console.error(`An error has occurred: ${error.message}`);
        }
      }
    }

    setInputTitle("");
    setInputVisibility("PUBLIC");
    setInputDescription("");
    handleClose();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!modalRef.current?.contains(event.target as Node)) {
        handleClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.3 },
    },
    exit: { scale: 0.95, opacity: 0 },
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          initial="hidden"
          animate="visible"
          exit="hidden"
          variants={overlayVariants}
        >
          <motion.form
            ref={modalRef}
            onSubmit={handleSubmit}
            className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden"
            variants={modalVariants}
          >
            <div className="p-6 space-y-6">
              <motion.div
                className="flex justify-between items-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center space-x-3">
                  <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                  <h2 className="text-2xl font-bold">Create New Board</h2>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </motion.div>

              <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {diagramOptions.map((option) => (
                  <DiagramOption
                    key={option.id}
                    icon={option.icon}
                    title={option.title}
                    description={option.description}
                    isSelected={selectedType === option.id}
                    onClick={() => setSelectedType(option.id)}
                    disabled={option.disabled}
                  />
                ))}
              </motion.div>

              {selectedType !== "BLANK" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="flex flex-col space-y-2"
                >
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Select Layout Type</p>
                  <div className="flex space-x-4">
                    {layoutOptions.map((option) => (
                      <LayoutOption
                        key={option.id}
                        icon={option.icon}
                        title={option.title}
                        isSelected={layoutType === option.id}
                        onClick={() => setLayoutType(option.id)}
                      />
                    ))}
                  </div>
                </motion.div>
              )}

              <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <article className="space-y-4">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center space-x-2"
                  ></motion.div>

                  <div className="relative space-y-4">
                    {selectedType == "BLANK" && (
                      <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative group">
                        <p className="text-grey dark:text-grey-blue text-sm mb-2">{text("name")}</p>
                        <Input
                          type="text"
                          placeholder={`Mind map ${text("name").toLowerCase()}`}
                          value={inputTitle}
                          onChange={handleTitleChange}
                          required
                        />
                      </motion.section>
                    )}

                    <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative group">
                      <p className="text-grey dark:text-grey-blue text-sm mb-2">{text("description")}</p>
                      <Textarea
                        placeholder={`${text("description").toLowerCase()}`}
                        value={inputDescription}
                        onChange={handleDescriptionChange}
                        required
                        disabled={fetchGenerateMindmap.isLoading}
                        ref={textareaRef}
                        className="w-full min-h-[120px] p-4 rounded-xl 
                          border-2 border-gray-200 dark:border-slate-700 
                          bg-white dark:bg-slate-800 
                          transition-all duration-300
                          focus:ring-2 focus:ring-primary focus:border-primary
                          hover:border-primary/50
                          cursor-text
                          resize-none"
                      />
                    </motion.section>
                  </div>
                </article>

                <motion.div
                  className="flex flex-wrap justify-between items-center p-6 rounded-xl bg-gray-50 dark:bg-slate-800/50"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <article className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2">
                      {inputVisibility === "PRIVATE" ? (
                        <Lock className="w-5 h-5 text-primary" />
                      ) : (
                        <Globe className="w-5 h-5 text-primary" />
                      )}
                      <p className="font-semibold">{text("private")}</p>
                    </div>
                    <p className="text-grey dark:text-grey-blue text-sm max-w-md">{text("onlyViewable")}</p>
                  </article>

                  <Switch
                    checked={inputVisibility === "PRIVATE"}
                    onCheckedChange={(checked) => setInputVisibility(checked ? "PRIVATE" : "PUBLIC")}
                    disabled={fetchGenerateMindmap.isLoading}
                  />
                </motion.div>

                <motion.div
                  className="flex flex-wrap items-center justify-end space-x-4 mt-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Button variant="outline" onClick={handleClose} className="relative overflow-hidden">
                    <span className="relative z-10">{uppercaseFirstLetter(text("cancel"))}</span>
                  </Button>

                  {selectedType !== "BLANK" ? (
                    <Button type="submit" disabled={fetchGenerateMindmap.isLoading} className="relative group">
                      <span className="relative z-10 flex items-center space-x-2">
                        <Sparkles className={fetchGenerateMindmap.isLoading ? "animate-spin" : ""} height={15} />
                        <span>
                          {uppercaseFirstLetter(
                            fetchGenerateMindmap.isLoading ? text("generating") + "..." : text("generate"),
                          )}
                        </span>
                      </span>
                    </Button>
                  ) : (
                    <Button type="submit" className="space-x-2">
                      <Plus className={fetchCreateMindmap.isLoading ? "animate-spin" : ""} height={15} />
                      {uppercaseFirstLetter(text("create"))}
                    </Button>
                  )}
                </motion.div>
              </motion.div>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export { NewBoardDialog };
