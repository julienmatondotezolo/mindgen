import React, { FC } from "react";

import { MindMapDialogProps } from "@/_types/MindMapDialogProps";
import { Input, Textarea } from "@/components/ui";

const MindmapDialog: FC<MindMapDialogProps> = ({ title, description, open, setIsOpen }) => {
  const handleClose = () => {
    setIsOpen(false);
  };

  const handleConfirm = () => {
    // Handle confirm action here
    handleClose();
  };

  return (
    <div className={`fixed inset-0 items-center justify-center z-50 dialog ${open ? "flex" : "hidden"}`}>
      <div className="bg-white p-4 rounded shadow-lg">
        <article className="space-y-2">
          <Input type="text" placeholder="Mindmap name" value={title ?? ""} />
          <Input type="text" placeholder="mindmap description" value={description ?? ""} />
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
