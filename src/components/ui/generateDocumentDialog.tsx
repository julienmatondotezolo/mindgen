/* eslint-disable prettier/prettier */
import { AnimatePresence, motion } from "framer-motion";
import {
  Book,
  BookText,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  FileType,
  Layout,
  PenTool,
  Sparkles,
  Users,
  Users2,
  X,
} from "lucide-react";
import { useSession } from "next-auth/react";
import React, { FC, useEffect, useRef, useState } from "react";
import { useMutation } from "react-query";
import { useRecoilValue } from "recoil";

import { generateDocument } from "@/_services";
import { CustomSession, DialogProps } from "@/_types";
import { Button, Textarea } from "@/components/ui";
import { edgesAtomState, layerAtomState } from "@/state";
import { convertToMermaid } from "@/utils";

const StyleOption = ({
  icon: Icon,
  title,
  description,
  isSelected,
  onClick,
}: {
  icon: any;
  title: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
}) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    type="button"
    className={`relative w-full p-4 rounded-xl transition-all duration-300 ${
      isSelected
        ? "bg-primary text-white shadow-lg shadow-primary/25"
        : "bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700"
    }`}
  >
    <div className="flex flex-col items-center space-y-2">
      <div className="flex items-center space-x-2">
        <Icon size={18} className={isSelected ? "text-white" : "text-primary"} />
        <span className="font-medium">{title}</span>
      </div>
      <p className="text-xs opacity-75">{description}</p>
    </div>
  </motion.button>
);

const GenerateDocumentDialog: FC<DialogProps> = ({ open, setIsOpen }) => {
  const modalRef = useRef<HTMLFormElement>(null);
  const [style, setStyle] = useState<string | null>(null);
  const [length, setLength] = useState<string | null>(null);
  const [format, setFormat] = useState<string | null>(null);
  const [audience, setAudience] = useState<string | null>(null);
  const [task, setTask] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const layers = useRecoilValue(layerAtomState);
  const edges = useRecoilValue(edgesAtomState);

  const session: any = useSession();
  const safeSession = session ? (session as unknown as CustomSession) : null;

  const fetchGenerateDocument = useMutation(generateDocument, {
    mutationKey: "GENERATE_DOCUMENT",
    onSuccess: async (blob: Blob) => {
      try {
        const url = window.URL.createObjectURL(blob);

        // Open PDF in new tab
        window.open(url, "_blank");

        // Also trigger download
        const link = document.createElement("a");

        link.href = url;
        const timestamp = new Date().getTime().toString().slice(-6);

        link.download = `mindmap_${timestamp}.pdf`;
        link.click();

        window.URL.revokeObjectURL(url);

        handleClose();
      } catch (error) {
        console.error("Error downloading PDF:", error);
        setError("Failed to download the document. Please try again.");
      }
    },
    onError: (error) => {
      console.error("Error generating document:", error);
      setError("Failed to generate document. Please try again.");
    },
  });

  const styleOptions = [
    { id: "ACADEMIC", icon: BookText, title: "Academic", description: "Formal academic writing style" },
    { id: "BUSINESS", icon: Layout, title: "Business", description: "Professional business format" },
    { id: "TECHNICAL", icon: PenTool, title: "Technical", description: "Detailed technical documentation" },
    { id: "CASUAL", icon: Book, title: "Casual", description: "Informal and conversational tone" },
    { id: "CREATIVE", icon: Sparkles, title: "Creative", description: "Imaginative and engaging style" },
  ];

  const lengthOptions = [
    { id: "BRIEF", icon: Clock, title: "Brief", description: "Short and concise format" },
    { id: "STANDARD", icon: Clock, title: "Standard", description: "Regular length document" },
    { id: "COMPREHENSIVE", icon: Clock, title: "Comprehensive", description: "Detailed and extensive" },
  ];

  const formatOptions = [
    { id: "REPORT", icon: FileType, title: "Report", description: "Structured report format" },
    { id: "PRESENTATION", icon: Layout, title: "Presentation", description: "Slide-based presentation" },
    { id: "DOCUMENTATION", icon: FileText, title: "Documentation", description: "Technical documentation" },
    { id: "ARTICLE", icon: Book, title: "Article", description: "Article format" },
    { id: "WHITEPAPER", icon: FileText, title: "Whitepaper", description: "Detailed whitepaper" },
  ];

  const audienceOptions = [
    { id: "BEGINNER", icon: Users, title: "Beginner", description: "New to the topic" },
    { id: "INTERMEDIATE", icon: Users2, title: "Intermediate", description: "Some knowledge" },
    { id: "EXPERT", icon: Users2, title: "Expert", description: "Advanced understanding" },
    { id: "MIXED", icon: Users, title: "Mixed", description: "Various expertise levels" },
  ];

  const validateStep = () => {
    switch (currentStep) {
      case 0:
        if (!task.trim()) {
          setError("Please provide a task");
          return false;
        }
        break;
      case 1:
        if (!style) {
          setError("Please select a writing style");
          return false;
        }
        break;
      case 2:
        if (!length) {
          setError("Please select a document length");
          return false;
        }
        break;
      case 3:
        if (!format) {
          setError("Please select a document format");
          return false;
        }
        break;
      case 4:
        if (!audience) {
          setError("Please select a target audience");
          return false;
        }
        break;
    }
    setError(null);
    return true;
  };

  const steps = [
    {
      title: "Task",
      content: (
        <section className="space-y-4">
          <h3 className="text-xl font-semibold">What would you like to generate?</h3>
          <Textarea
            placeholder="Describe what you want to generate..."
            value={task}
            onChange={(e) => setTask(e.target.value)}
            required
            className="min-h-[150px]"
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </section>
      ),
    },
    {
      title: "Style",
      content: (
        <section className="space-y-4">
          <h3 className="text-xl font-semibold">Choose your writing style</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {styleOptions.map((option) => (
              <StyleOption
                key={option.id}
                icon={option.icon}
                title={option.title}
                description={option.description}
                isSelected={style === option.id}
                onClick={() => setStyle(option.id)}
              />
            ))}
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </section>
      ),
    },
    {
      title: "Length",
      content: (
        <section className="space-y-4">
          <h3 className="text-xl font-semibold">Select document length</h3>
          <div className="grid grid-cols-3 gap-4">
            {lengthOptions.map((option) => (
              <StyleOption
                key={option.id}
                icon={option.icon}
                title={option.title}
                description={option.description}
                isSelected={length === option.id}
                onClick={() => setLength(option.id)}
              />
            ))}
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </section>
      ),
    },
    {
      title: "Format",
      content: (
        <section className="space-y-4">
          <h3 className="text-xl font-semibold">Choose document format</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {formatOptions.map((option) => (
              <StyleOption
                key={option.id}
                icon={option.icon}
                title={option.title}
                description={option.description}
                isSelected={format === option.id}
                onClick={() => setFormat(option.id)}
              />
            ))}
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </section>
      ),
    },
    {
      title: "Audience",
      content: (
        <section className="space-y-4">
          <h3 className="text-xl font-semibold">Select target audience</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {audienceOptions.map((option) => (
              <StyleOption
                key={option.id}
                icon={option.icon}
                title={option.title}
                description={option.description}
                isSelected={audience === option.id}
                onClick={() => setAudience(option.id)}
              />
            ))}
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </section>
      ),
    },
    {
      title: "Summary",
      content: (
        <section className="space-y-6">
          <h3 className="text-xl font-semibold">Review Your Document Settings</h3>
          <motion.div
            className="grid gap-6 p-6 bg-gray-50 dark:bg-slate-800 rounded-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">Task</p>
                <p className="font-medium line-clamp-2">{task || "No task provided"}</p>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">Writing Style</p>
                <div className="flex items-center space-x-2">
                  {style
                    ? React.createElement(styleOptions.find((opt) => opt.id === style)?.icon || "div", {
                      className: "w-4 h-4 text-primary",
                    })
                    : null}
                  <p className="font-medium">{styleOptions.find((opt) => opt.id === style)?.title || "Not selected"}</p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">Document Length</p>
                <div className="flex items-center space-x-2">
                  {length
                    ? React.createElement(lengthOptions.find((opt) => opt.id === length)?.icon || "div", {
                      className: "w-4 h-4 text-primary",
                    })
                    : null}
                  <p className="font-medium">
                    {lengthOptions.find((opt) => opt.id === length)?.title || "Not selected"}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">Format</p>
                <div className="flex items-center space-x-2">
                  {format
                    ? React.createElement(formatOptions.find((opt) => opt.id === format)?.icon || "div", {
                      className: "w-4 h-4 text-primary",
                    })
                    : null}
                  <p className="font-medium">
                    {formatOptions.find((opt) => opt.id === format)?.title || "Not selected"}
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">Target Audience</p>
                <div className="flex items-center space-x-2">
                  {audience
                    ? React.createElement(audienceOptions.find((opt) => opt.id === audience)?.icon || "div", {
                      className: "w-4 h-4 text-primary",
                    })
                    : null}
                  <p className="font-medium">
                    {audienceOptions.find((opt) => opt.id === audience)?.title || "Not selected"}
                  </p>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t dark:border-gray-700">
              {!task || !style || !length || !format || !audience ? (
                <p className="text-red-500 text-sm">Please complete all selections before generating</p>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Ready to generate your {format.toLowerCase()} with a {style.toLowerCase()} style for a{" "}
                  {audience.toLowerCase()} audience?
                </p>
              )}
            </div>
          </motion.div>
        </section>
      ),
    },
  ];

  const handleClose = () => {
    setIsOpen(false);
    setTask("");
    setCurrentStep(0);
    setStyle(null);
    setLength(null);
    setFormat(null);
    setAudience(null);
    setError(null);
  };

  const nextStep = (e: React.MouseEvent) => {
    e.preventDefault();
    if (validateStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const prevStep = (e: React.MouseEvent) => {
    e.preventDefault();
    setError(null);
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task || !style || !length || !format || !audience) {
      setError("Please complete all selections before generating");
      return;
    }
    await fetchGenerateDocument.mutateAsync({
      session: safeSession,
      task: task,
      mermaid: convertToMermaid(layers, edges),
      style: style,
      length: length,
      format: format,
      audience: audience,
    });
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

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.form
            ref={modalRef}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden"
            onSubmit={handleSubmit}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-3">
                  <FileText className="w-6 h-6 text-primary" />
                  <h2 className="text-2xl font-bold">Generate Document</h2>
                </div>
                <button type="button" onClick={handleClose} className="text-gray-500 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  {steps.map((step, index) => (
                    <div key={index} className={`flex items-center ${index !== steps.length - 1 ? "flex-1" : ""}`}>
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          index <= currentStep ? "bg-primary text-white" : "bg-gray-200 dark:bg-slate-700"
                        }`}
                      >
                        {index + 1}
                      </div>
                      {index !== steps.length - 1 && (
                        <div
                          className={`flex-1 h-1 mx-2 ${
                            index < currentStep ? "bg-primary" : "bg-gray-200 dark:bg-slate-700"
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <motion.div
                key={currentStep}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="min-h-[300px]"
              >
                {steps[currentStep].content}
              </motion.div>

              <div className="flex justify-between mt-8">
                <Button type="button" variant="outline" onClick={prevStep} disabled={currentStep === 0}>
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                {currentStep === steps.length - 1 ? (
                  <Button
                    type="submit"
                    disabled={!task || !style || !length || !format || !audience || fetchGenerateDocument.isLoading}
                  >
                    {fetchGenerateDocument.isLoading ? (
                      <>
                        <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        Generate
                        <Sparkles className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                ) : (
                  <Button type="button" onClick={nextStep}>
                    Next
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </motion.form>
        </div>
      )}
    </AnimatePresence>
  );
};

export { GenerateDocumentDialog };
