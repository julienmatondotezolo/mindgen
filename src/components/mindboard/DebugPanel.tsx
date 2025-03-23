import React from "react";

import { CanvasMode } from "@/_types/canvas";

// Debug Panel Component
export const DebugPanel = ({
  canvasState,
  camera,
  activeLayers,
  activeEdgeId,
  isOpen,
  setIsOpen,
}: {
  canvasState: any;
  camera: any;
  activeLayers: string[];
  activeEdgeId: string[];
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div
      className="absolute top-4 right-4 z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg max-w-md overflow-hidden"
      style={{ maxHeight: isOpen ? "calc(100vh - 200px)" : "40px" }}
    >
      <button
        className="w-full p-2 flex justify-between items-center cursor-pointer bg-gray-100 dark:bg-gray-900 text-left"
        onClick={toggleOpen}
        aria-expanded={isOpen}
        aria-label="Toggle debug panel"
      >
        <span className="font-semibold">
          Debug Panel <span className="text-xs font-normal text-gray-500">(Ctrl+Alt+D to toggle)</span>
        </span>
        <span>{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div className="p-3 overflow-auto text-xs" style={{ maxHeight: "calc(100vh - 240px)" }}>
          <div className="mb-3">
            <h3 className="font-bold mb-1">Canvas State: {CanvasMode[canvasState.mode]}</h3>
            <pre className="bg-gray-50 dark:bg-gray-950 p-2 rounded overflow-auto">
              {JSON.stringify(canvasState, null, 2)}
            </pre>
          </div>

          <div className="mb-3">
            <h3 className="font-bold mb-1">Camera State</h3>
            <pre className="bg-gray-50 dark:bg-gray-950 p-2 rounded overflow-auto">
              {JSON.stringify(camera, null, 2)}
            </pre>
          </div>

          <div className="mb-3">
            <h3 className="font-bold mb-1">Active Layers ({activeLayers.length})</h3>
            <pre className="bg-gray-50 dark:bg-gray-950 p-2 rounded overflow-auto">
              {JSON.stringify(activeLayers, null, 2)}
            </pre>
          </div>

          <div className="mb-3">
            <h3 className="font-bold mb-1">Active Edge ({activeEdgeId.length})</h3>
            <pre className="bg-gray-50 dark:bg-gray-950 p-2 rounded overflow-auto">
              {JSON.stringify(activeEdgeId, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
