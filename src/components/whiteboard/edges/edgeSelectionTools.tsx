import { ArrowRight, Ellipsis, PaintBucket, Route, Spline, Trash2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { memo, useCallback, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";

import { Camera, CanvasMode, Color, EdgeShape, EdgeType } from "@/_types";
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
import { ToolButton } from "../ToolButton";

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

  const activeEdgeId = allActiveEdges[0];

  const selectedEdge = edges.find((edge) => {
    if (activeEdgeId) return allActiveEdges.includes(edge.id);
  });

  const handleColorChange = useCallback(
    (color: Color) => {
      setLastUsedColor(color);
      if (selectedEdge) {
        updateEdge({
          id: selectedEdge.id,
          updatedElementEdge: { color },
        });
        setShowColorPicker(false);
      }
    },
    [selectedEdge, setLastUsedColor, updateEdge],
  );

  const handleEdgeShape = useCallback(() => {
    if (selectedEdge) {
      const newShape = selectedEdge.shape === EdgeShape.Curved ? EdgeShape.SmoothStep : EdgeShape.Curved;

      updateEdge({
        id: selectedEdge.id,
        updatedElementEdge: { shape: newShape },
      });
    }
  }, [selectedEdge, updateEdge]);

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
      unSelectEdge();
      setCanvasState({
        mode: CanvasMode.None,
      });
    }
  }, [isDeletable, selectedEdge, removeEdge, currentUserId, unSelectEdge, setCanvasState]);

  const handleToggleEdgeType = useCallback(() => {
    if (selectedEdge) {
      const newType = selectedEdge.type === EdgeType.Dashed ? EdgeType.Solid : EdgeType.Dashed;

      updateEdge({
        id: selectedEdge.id,
        updatedElementEdge: { type: newType },
      });
    }
  }, [selectedEdge, updateEdge]);

  const handleToggleThickness = useCallback(() => {
    if (selectedEdge) {
      const newThickness = selectedEdge.thickness === 2 ? 4 : 2;

      updateEdge({
        id: selectedEdge.id,
        updatedElementEdge: { thickness: newThickness },
      });
    }
  }, [selectedEdge, updateEdge]);

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

  const objectSizesWitdh = 4000;
  const objectSizesHeight = 1950;

  const x = selectedEdge.start.x - 1800;
  const y = selectedEdge.end.y - 1950;

  return (
    <foreignObject className="relative" x={x} y={y} width={objectSizesWitdh} height={objectSizesHeight}>
      {/* <div
        className="absolute top-0 left-0"
        style={{
          background: "white",
          width: objectSizesWitdh,
          height: objectSizesHeight,
        }}
      ></div> */}
      <div
        className="absolute w-auto px-2 py-1 bg-white rounded-xl shadow-lg backdrop-filter backdrop-blur-lg dark:border dark:bg-slate-600 dark:bg-opacity-20 dark:border-slate-800 text-slate-950 dark:text-slate-200"
        style={{
          transform: `translate(1800px, 1820px) scale(${1 / camera.scale})`,
          transformOrigin: "bottom center",
        }}
      >
        {showColorPicker && (
          <div
            className="absolute bg-white rounded-xl shadow-lg backdrop-filter backdrop-blur-lg dark:border dark:bg-slate-600 dark:bg-opacity-20 dark:border-slate-800"
            style={{
              bottom: 65,
              left: 0,
              transform: `translate(0px, 0px)`,
            }}
          >
            <ColorPicker onChange={handleColorChange} onClose={() => setShowColorPicker(false)} />
          </div>
        )}
        <ul className="flex flex-row space-x-2 items-center justify-between">
          <ToolButton
            icon={PaintBucket}
            onClick={() => setShowColorPicker(!showColorPicker)}
            isActive={showColorPicker}
          />
          <div className="w-[1px] h-6 self-center mx-2 bg-slate-200 dark:bg-slate-700"></div>
          <ToolButton icon={Ellipsis} onClick={handleToggleEdgeType} isActive={selectedEdge.type === EdgeType.Dashed} />
          <ToolButton onClick={handleToggleThickness} isActive={selectedEdge.thickness === 4 ? true : false}>
            <div
              className={`w-[20px] h-[5px] dark:bg-slate-200 ${
                selectedEdge.thickness === 4 ? "bg-slate-200" : "bg-slate-950"
              }`}
            ></div>
          </ToolButton>
          <div className="w-[1px] h-6 self-center mx-2 bg-slate-200 dark:bg-slate-700"></div>
          {/* <ToolButton icon={ArrowLeft} onClick={() => handleToggleArrow("left")} isActive={selectedEdge.arrowEnd} /> */}
          <ToolButton icon={selectedEdge.shape === EdgeShape.Curved ? Spline : Route} onClick={handleEdgeShape} />
          <ToolButton icon={ArrowRight} onClick={() => handleToggleArrow("left")} isActive={selectedEdge.arrowEnd} />
          <div className="w-[1px] h-6 self-center mx-2 bg-slate-200 dark:bg-slate-700"></div>
          <ToolButton icon={Trash2} onClick={handleRemoveEdge} />
        </ul>
      </div>
    </foreignObject>
  );
});

EdgeSelectionTools.displayName = "EdgeSelectionTools";
