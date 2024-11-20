import { ArrowLeft, ArrowRight, Ellipsis, Minus, PaintBucket, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { memo, useCallback, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";

import { Camera, CanvasMode, Color, EdgeType } from "@/_types";
import { ToolButton } from "@/components/mindmap/toolButton";
import { Button } from "@/components/ui/button";
import {
  activeEdgeIdAtom,
  boardIdState,
  canvasStateAtom,
  edgesAtomState,
  useRemoveEdge,
  useUnSelectEdgeElement,
  useUpdateEdge,
} from "@/state";

import { ColorPicker } from "../colorPicker";

interface EdgeSelectionToolsProps {
  camera: Camera;
  isDeletable: boolean;
  // eslint-disable-next-line no-unused-vars
  setLastUsedColor: (color: Color) => void;
}

export const EdgeSelectionTools = memo(({ camera, isDeletable, setLastUsedColor }: EdgeSelectionToolsProps) => {
  const session = useSession();
  const currentUserId = session.data?.session?.user?.id;

  const edges = useRecoilValue(edgesAtomState);
  const allActiveEdges = useRecoilValue(activeEdgeIdAtom);
  const setCanvasState = useSetRecoilState(canvasStateAtom);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const boardId = useRecoilValue(boardIdState);

  const unSelectEdge = useUnSelectEdgeElement({ roomId: boardId });
  const removeEdge = useRemoveEdge({ roomId: boardId });
  const updateEdge = useUpdateEdge({ roomId: boardId });

  const activeEdgeId = allActiveEdges
    .filter((userActiveEdge: any) => userActiveEdge.userId === currentUserId)
    .map((item: any) => item.edgeIds)[0];

  const selectedEdge = edges.find((edge) => {
    if (activeEdgeId) return activeEdgeId.includes(edge.id);
  });

  const handleColorChange = useCallback(
    (color: Color) => {
      setLastUsedColor(color);
      if (selectedEdge) {
        updateEdge({
          id: selectedEdge.id,
          userId: currentUserId,
          updatedElementEdge: { color },
        });
        setShowColorPicker(false);
      }
    },
    [currentUserId, selectedEdge, setLastUsedColor, updateEdge],
  );

  const handleRemoveEdge = useCallback(() => {
    if (isDeletable) {
      alert("You don't have the rights to delete");
      return;
    }
    if (selectedEdge) {
      removeEdge({
        id: selectedEdge.id,
        userId: currentUserId,
      });
      unSelectEdge({ userId: currentUserId });
      setCanvasState({
        mode: CanvasMode.None,
      });
    }
  }, [isDeletable, selectedEdge, removeEdge, currentUserId, unSelectEdge, setCanvasState]);

  const handleChangeStrokeWidth = useCallback(
    (number: number) => {
      if (selectedEdge) {
        updateEdge({
          id: selectedEdge.id,
          userId: currentUserId,
          updatedElementEdge: { thickness: number },
        });
      }
    },
    [currentUserId, selectedEdge, updateEdge],
  );

  const handleToggleEdgeType = useCallback(() => {
    if (selectedEdge) {
      const newType = selectedEdge.type === EdgeType.Dashed ? EdgeType.Solid : EdgeType.Dashed;

      updateEdge({
        id: selectedEdge.id,
        userId: currentUserId,
        updatedElementEdge: { type: newType },
      });
    }
  }, [currentUserId, selectedEdge, updateEdge]);

  const handleToggleThickness = useCallback(() => {
    if (selectedEdge) {
      const newThickness = selectedEdge.thickness === 2 ? 4 : 2;

      updateEdge({
        id: selectedEdge.id,
        userId: currentUserId,
        updatedElementEdge: { thickness: newThickness },
      });
    }
  }, [currentUserId, selectedEdge, updateEdge]);

  const handleToggleArrow = useCallback(
    (arrow: string) => {
      if (arrow == "left" && selectedEdge) {
        const newArrowEnd = selectedEdge.arrowEnd ? false : true;

        updateEdge({
          id: selectedEdge.id,
          userId: currentUserId,
          updatedElementEdge: { arrowEnd: newArrowEnd },
        });
      } else if (arrow == "right" && selectedEdge) {
        const newArrowStart = selectedEdge.arrowStart ? false : true;

        updateEdge({
          id: selectedEdge.id,
          userId: currentUserId,
          updatedElementEdge: { arrowStart: newArrowStart },
        });
      }
    },
    [currentUserId, selectedEdge, updateEdge],
  );

  if (!selectedEdge) return null;

  const x = (selectedEdge.start.x + selectedEdge.end.x) / 2.5 + camera.x;
  const y = (selectedEdge.start.y + selectedEdge.end.y) / 6 + camera.y;

  return (
    <>
      {showColorPicker && (
        <div
          className="absolute bg-white rounded-xl shadow-lg backdrop-filter backdrop-blur-lg dark:border dark:bg-slate-600 dark:bg-opacity-20 dark:border-slate-800"
          style={{
            top: `${y}px`,
            transform: `translate(${x - 50}px, ${y - 150}px)`,
          }}
        >
          <ColorPicker onChange={handleColorChange} onClose={() => setShowColorPicker(false)} />
        </div>
      )}
      <div
        className="absolute w-auto px-2 py-1 bg-white rounded-xl shadow-lg backdrop-filter backdrop-blur-lg dark:border dark:bg-slate-600 dark:bg-opacity-20 dark:border-slate-800"
        style={{
          top: `${y}px`,
          transform: `translate(${x}px, ${y}px)`,
        }}
      >
        <ul className="flex flex-row space-x-2 items-center justify-between">
          <ToolButton
            icon={PaintBucket}
            onClick={() => setShowColorPicker(!showColorPicker)}
            isActive={showColorPicker}
          />
          <div className="w-[1px] h-6 self-center mx-2 bg-slate-200 dark:bg-slate-700"></div>
          <ToolButton icon={Minus} onClick={() => handleChangeStrokeWidth(2)} isActive={selectedEdge.thickness === 2} />
          <ToolButton icon={Ellipsis} onClick={handleToggleEdgeType} isActive={selectedEdge.type === EdgeType.Dashed} />
          <Button
            variant={selectedEdge.thickness === 4 ? "boardActive" : "board"}
            size="icon"
            onClick={handleToggleThickness}
          >
            <div
              className={`w-[20px] h-[5px] dark:bg-slate-200 ${
                selectedEdge.thickness === 4 ? "bg-slate-200" : "bg-slate-950"
              }`}
            ></div>
          </Button>
          <div className="w-[1px] h-6 self-center mx-2 bg-slate-200 dark:bg-slate-700"></div>
          <ToolButton icon={ArrowLeft} onClick={() => handleToggleArrow("left")} isActive={selectedEdge.arrowEnd} />
          <ToolButton icon={ArrowRight} onClick={() => handleToggleArrow("right")} isActive={selectedEdge.arrowStart} />
          <div className="w-[1px] h-6 self-center mx-2 bg-slate-200 dark:bg-slate-700"></div>
          <Button variant="board" size="icon" onClick={handleRemoveEdge}>
            <Trash2 />
          </Button>
        </ul>
      </div>
    </>
  );
});

EdgeSelectionTools.displayName = "EdgeSelectionTools";
