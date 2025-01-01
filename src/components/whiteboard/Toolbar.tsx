/* eslint-disable no-unused-vars */
import { Circle, Diamond, Hand, MousePointer2, MoveRight, Redo2, Square, Type, Undo2 } from "lucide-react";
import { useSession } from "next-auth/react";
import React from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";

import { CanvasMode, LayerType } from "@/_types";
import { activeEdgeIdAtom, activeLayersAtom, canvasStateAtom, useUndoRedo } from "@/state";

import { ToolButton } from "./ToolButton";

const Toolbar = () => {
  const session: any = useSession();
  const currentUserId = session.data?.session?.user?.id;

  const [canvasState, setCanvasState] = useRecoilState(canvasStateAtom);
  const { undo, redo } = useUndoRedo();
  const setActiveLayerIDs = useSetRecoilState(activeLayersAtom);

  const allActiveEdges: any = useRecoilValue(activeEdgeIdAtom);
  const activeEdgeId = allActiveEdges
    .filter((userActiveEdge: any) => userActiveEdge.userId === currentUserId)
    .map((item: any) => item.edgeIds)[0];

  return (
    <div className="fixed left-2/4 -translate-x-2/4 top-5 z-50">
      <div className="flex w-auto p-2 bg-white rounded-xl shadow-lg backdrop-filter backdrop-blur-lg dark:border dark:bg-slate-600 dark:bg-opacity-20 dark:border-slate-800">
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

          <div className="w-[1px] h-6 self-center mx-2 bg-slate-200 dark:bg-slate-700"></div>

          <ToolButton
            icon={Square}
            onClick={() => {
              setCanvasState({
                mode: CanvasMode.Inserting,
                layerType: LayerType.Rectangle,
              });
              setActiveLayerIDs([]);
            }}
            isActive={canvasState.mode === CanvasMode.Inserting && canvasState.layerType === LayerType.Rectangle}
          />
          <ToolButton
            icon={Circle}
            onClick={() => {
              setCanvasState({
                mode: CanvasMode.Inserting,
                layerType: LayerType.Ellipse,
              });
              setActiveLayerIDs([]);
            }}
            isActive={canvasState.mode === CanvasMode.Inserting && canvasState.layerType === LayerType.Ellipse}
          />
          <ToolButton
            icon={Diamond}
            onClick={() => {
              setCanvasState({
                mode: CanvasMode.Inserting,
                layerType: LayerType.Diamond,
              });
              setActiveLayerIDs([]);
            }}
            isActive={canvasState.mode === CanvasMode.Inserting && canvasState.layerType === LayerType.Diamond}
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

          <div className="w-[1px] h-6 self-center mx-2 bg-slate-200 dark:bg-slate-700"></div>

          <ToolButton
            icon={MoveRight}
            onClick={() =>
              setCanvasState({
                mode: CanvasMode.Edge,
              })
            }
            isActive={canvasState.mode === CanvasMode.Edge || (activeEdgeId && activeEdgeId[0] === "")}
          />
        </ul>
      </div>
    </div>
  );
};

export { Toolbar };
