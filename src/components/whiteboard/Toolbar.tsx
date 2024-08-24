/* eslint-disable no-unused-vars */
import { Circle, Hand, MousePointer2, MoveRight, Redo2, Square, Type, Undo2 } from "lucide-react";
import React from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";

import { CanvasMode, CanvasState, LayerType } from "@/_types";
import { activeEdgeIdAtom, activeLayersAtom, useUndoRedo } from "@/state";

import { ToolButton } from "./ToolButton";

interface ToolbarProps {
  canvasState: CanvasState;
  setCanvasState: (newState: CanvasState) => void;
}

const Toolbar = ({ canvasState, setCanvasState }: ToolbarProps) => {
  const { undo, redo } = useUndoRedo();
  const setActiveLayerIDs = useSetRecoilState(activeLayersAtom);
  const activeEdgeId = useRecoilValue(activeEdgeIdAtom);

  return (
    <div className="fixed left-2/4 -translate-x-2/4 top-5 z-50">
      <div className="flex w-auto px-1 bg-white rounded-xl shadow-lg backdrop-filter backdrop-blur-lg dark:border dark:bg-slate-600 dark:bg-opacity-20 dark:border-slate-800">
        <ul className="flex flex-row items-center justify-between">
          <ToolButton icon={Undo2} onClick={() => undo.handle()} disabled={!undo.can} />
          <ToolButton icon={Redo2} onClick={() => redo.handle()} disabled={!redo.can} />

          <div className="w-[1px] h-6 self-center mx-2 bg-slate-200 dark:bg-slate-700"></div>

          <ToolButton
            icon={Hand}
            onClick={() => {
              setCanvasState({ mode: CanvasMode.Grab });
              setActiveLayerIDs([]);
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
          <ToolButton
            icon={MoveRight}
            onClick={() =>
              setCanvasState({
                mode: CanvasMode.Edge,
              })
            }
            isActive={canvasState.mode === CanvasMode.Edge || activeEdgeId}
          />
          <ToolButton
            icon={Type}
            onClick={() =>
              setCanvasState({
                mode: CanvasMode.Typing,
              })
            }
            isActive={canvasState.mode === CanvasMode.Typing}
          />
        </ul>
      </div>
    </div>
  );
};

export { Toolbar };
