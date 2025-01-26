import Image from "next/image";
import { useSession } from "next-auth/react";
import React, { useCallback, useEffect, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, File, X } from "lucide-react";

import { CanvasMode, Edge, Layer } from "@/_types";
import { usePathname } from "@/navigation";
import {
  canvasStateAtom,
  edgesAtomState,
  importModalState,
  layerAtomState,
  useAddEdgeElement,
  useAddElement,
  useRemoveEdge,
  useRemoveElement,
} from "@/state";
import { importMindmap } from "@/utils";

import { Button } from "./button";

interface PdfDropZoneProps {}

const PdfDropZone: React.FC<PdfDropZoneProps> = () => {
  const pathname = usePathname();
  const [boardId, setBoardId] = useState<string>("");

  const session: any = useSession();
  const currentUserId = session.data?.session?.user?.id;

  useEffect(() => {
    if (pathname.includes("board")) {
      const extractedBoardId = pathname.split("board/")[1];
      setBoardId(extractedBoardId);
    }
  }, [pathname]);

  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [file, setFile] = useState<File | null>();

  const setIsOpen = useSetRecoilState(importModalState);
  const setCanvasState = useSetRecoilState(canvasStateAtom);

  const layers = useRecoilValue(layerAtomState);
  const edges = useRecoilValue(edgesAtomState);

  const currentLayerIds = layers.map((layer) => layer.id);

  const addLayer = useAddElement({ roomId: boardId });
  const addEdge = useAddEdgeElement({ roomId: boardId });
  const removeLayer = useRemoveElement({ roomId: boardId });
  const removeEdge = useRemoveEdge({ roomId: boardId });

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingOver(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingOver(false);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingOver(false);

    if (!event.dataTransfer.files || !event.dataTransfer.files.length) {
      return;
    }

    const fileList = Array.from(event.dataTransfer.files).filter((file) => file.type === "application/json");

    if (fileList.length) {
      setFile(fileList[0]);
      const fileInput = document.getElementById("json-upload") as HTMLInputElement;
      fileInput.value = "";
      fileList.forEach((file) => {
        const fileItem = new File([file], file.name, { type: file.type });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(fileItem);
        fileInput.files = dataTransfer.files;
      });
    } else {
      console.error("Only json files are allowed.");
    }
  }, []);

  const onSubmit = async ({
    e,
    currentLayers,
    currentEdges,
  }: {
    e: React.FormEvent<HTMLFormElement>;
    currentLayers: Layer[];
    currentEdges: Edge[];
  }) => {
    e.preventDefault();
    if (!file) return;

    try {
      setCanvasState({ mode: CanvasMode.Importing });
      removeLayer({ layerIdsToDelete: currentLayerIds, userId: currentUserId });

      for (const layer of currentLayers) {
        if (layer) {
          currentEdges.forEach((edge) => {
            if (edge.fromLayerId === layer.id || edge.toLayerId === layer.id) {
              removeEdge({
                id: edge.id,
                userId: currentUserId,
              });
            }
          });
        }
      }

      const result = await importMindmap(file);
      const { importedLayers, importedEdges } = result;

      if (importedLayers && importedEdges) {
        importedLayers.forEach((newLayer: Layer) => {
          addLayer({ layer: newLayer, userId: currentUserId });
        });

        importedEdges.forEach((newEdge: Edge) => {
          addEdge({ edge: newEdge, userId: currentUserId });
        });
      }

      setIsOpen(false);
      setFile(undefined);
    } catch (e: any) {
      console.error(e);
    }
  };

  return (
    <form onSubmit={(e) => onSubmit({ e, currentLayers: layers, currentEdges: edges })} className="w-full">
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative group flex flex-col items-center justify-center ${
          isDraggingOver ? "border-primary-color" : "border-grey-blue"
        } border-dashed border-2 p-8 text-center min-h-[200px] mb-4 rounded-xl transition-all duration-300 ${
          isDraggingOver
            ? "bg-primary-color/10 scale-105"
            : "bg-white/50 dark:bg-slate-800/30 hover:bg-primary-color/5"
        }`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <motion.div
          className="flex flex-col items-center space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <UploadCloud
            className={`w-10 h-10 ${
              isDraggingOver ? "text-primary-color" : "text-grey-blue"
            } transition-colors duration-300`}
          />
          <div className="space-y-1">
            <p className="text-lg font-medium">Drag & Drop your Mindmap</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Supports: .json files</p>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400">or</p>
          <label
            htmlFor="json-upload"
            className="px-6 py-2 rounded-full bg-primary-color text-white hover:bg-primary-color/90 transition-colors cursor-pointer"
          >
            Browse Files
          </label>
        </motion.div>
        <input
          type="file"
          accept=".json"
          id="json-upload"
          className="absolute top-0 left-0 right-0 bottom-0 opacity-0 cursor-pointer"
          onChange={(e) => setFile(e.target.files?.[0])}
          required
        />
      </motion.div>

      <AnimatePresence>
        {file && (
          <motion.article
            className="w-full"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <section className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800/30 rounded-lg mb-4">
              <div className="flex items-center space-x-3">
                <File className="w-5 h-5 text-gray-500" />
                <p className="font-medium">{file.name}</p>
              </div>
              <button
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                onClick={() => setFile(null)}
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </section>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary-color to-blue-600 hover:opacity-90"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Upload & Transform
            </Button>
          </motion.article>
        )}
      </AnimatePresence>
    </form>
  );
};

export { PdfDropZone };
