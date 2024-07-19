import { Circle, Hand, MousePointer2, Square } from "lucide-react";
import React from "react";

import { CanvasMode, CanvasState, LayerType } from "@/_types";

import { ToolButton } from "./ToolButton";

interface ToolbarProps {
  canvasState: CanvasState;
  setCanvasState: (newState: CanvasState) => void;
}

const Toolbar = ({ canvasState, setCanvasState }: ToolbarProps) => (
  <div className="fixed left-2/4 -translate-x-2/4 top-5 z-50">
    <div className="flex w-auto px-1 bg-white rounded-xl shadow-lg backdrop-filter backdrop-blur-lg dark:border dark:bg-slate-600 dark:bg-opacity-20 dark:border-slate-800">
      <ul className="flex flex-row items-center justify-between">
        <ToolButton
          icon={Hand}
          onClick={() => {
            setCanvasState({ mode: CanvasMode.Grab });
          }}
          isActive={canvasState.mode === CanvasMode.Grab}
        />
        <ToolButton
          icon={MousePointer2}
          onClick={() => setCanvasState({ mode: CanvasMode.None })}
          isActive={
            canvasState.mode === CanvasMode.None ||
            canvasState.mode === CanvasMode.SelectionNet ||
            canvasState.mode === CanvasMode.Resizing
          }
        />
        <ToolButton
          icon={Square}
          onClick={() =>
            setCanvasState({
              mode: CanvasMode.Inserting,
              layerType: LayerType.Rectangle,
            })
          }
          isActive={canvasState.mode === CanvasMode.Inserting && canvasState.layerType === LayerType.Rectangle}
        />
        <ToolButton
          icon={Circle}
          onClick={() =>
            setCanvasState({
              mode: CanvasMode.Inserting,
              layerType: LayerType.Ellipse,
            })
          }
          isActive={canvasState.mode === CanvasMode.Inserting && canvasState.layerType === LayerType.Ellipse}
        />
      </ul>
    </div>
  </div>
);

export { Toolbar };
