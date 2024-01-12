import React, { FC, useState } from "react";
import { useMutation, useQueryClient } from "react-query";

import { createMindmap } from "@/_services";
import { MindMapDialogProps } from "@/_types/MindMapDialogProps";
import { Input } from "@/components/ui";
import { emptyMindMapObject } from "@/utils";

const MindmapDialog: FC<MindMapDialogProps> = ({ title, description, open, setIsOpen }) => {
  const handleClose = () => {
    setIsOpen(false);
  };

  const queryClient = useQueryClient();
  const { mutateAsync } = useMutation(createMindmap, {
    mutationKey: "CREATE_MINDMAP",
  });

  // Initialize state for title and description
  const [inputTitle, setInputTitle] = useState(title ?? "");
  const [inputDescription, setInputDescription] = useState(description ?? "");

  // Update state when input changes
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputTitle(e.target.value);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    handleClose();
  };

  return (
    <div className={`fixed inset-0 items-center justify-center z-50 dialog ${open ? "flex" : "hidden"}`}>
      <div className="bg-white p-4 rounded shadow-lg">
        <article className="space-y-2">
          <Input type="text" placeholder="Mindmap name" value={inputTitle} onChange={handleTitleChange} />
          <Input
            type="text"
            placeholder="mindmap description"
            value={inputDescription}
            onChange={handleDescriptionChange}
          />
        </article>
        <div className="dialog-actions mt-4">
          <button onClick={handleClose} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ml-4"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export { MindmapDialog };
