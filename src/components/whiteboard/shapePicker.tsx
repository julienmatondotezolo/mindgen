/* eslint-disable no-unused-vars */
"use client";

import { Circle, Diamond, LucideIcon, Square, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRecoilState, useRecoilValue } from "recoil";

import { CanvasMode, LayerType } from "@/_types/canvas";
import { activeLayersAtom, canvasStateAtom, layerAtomState } from "@/state";
import { getLayerById } from "@/utils";

import { Button } from "../ui";

interface ShapePickerProps {
  onChange: (shape: LayerType) => void;
  onClose: () => void;
}

export const ShapePicker = ({ onChange, onClose }: ShapePickerProps) => {
  const session = useSession();
  const currentUserId = session.data?.session?.user?.id;

  const layers = useRecoilValue(layerAtomState);
  const allActiveLayers = useRecoilValue(activeLayersAtom);

  const activeLayerIDs = allActiveLayers
    .filter((userActiveLayer: any) => userActiveLayer.userId === currentUserId)
    .map((item: any) => item.layerIds)[0];

  const currentLayer = getLayerById({ layerId: activeLayerIDs ? activeLayerIDs[0] : 0, layers });

  return (
    <div className="p-2">
      <div className="flex justify-end items-end mb-2">
        <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
          <X size={16} />
        </button>
      </div>
      <ul className="flex flex-wrap gap-2 items-center max-w-[164px]">
        <ShapeButton
          icon={Circle}
          shape={LayerType.Ellipse}
          onClick={onChange}
          isActive={currentLayer.type === LayerType.Ellipse}
        />
        <ShapeButton
          icon={Square}
          shape={LayerType.Rectangle}
          onClick={onChange}
          isActive={currentLayer.type === LayerType.Rectangle}
        />
        <ShapeButton
          icon={Diamond}
          shape={LayerType.Diamond}
          onClick={onChange}
          isActive={currentLayer.type === LayerType.Diamond}
        />
      </ul>
    </div>
  );
};

interface ShapeButtonProps {
  icon: LucideIcon;
  onClick: (shape: LayerType) => void;
  isActive?: boolean;
  disabled?: boolean;
  shape: LayerType;
}

export const ShapeButton = ({ icon: Icon, onClick, isActive, disabled, shape }: ShapeButtonProps) => {
  const [canvasState, setCanvasState] = useRecoilState(canvasStateAtom);

  return (
    <li className="m-1 cursor-pointer">
      <Button
        disabled={disabled}
        onMouseEnter={() => {
          setCanvasState({
            mode: CanvasMode.Tooling,
          });
        }}
        // onMouseLeave={() => {
        //   if (
        //     canvasState.mode === CanvasMode.Grab ||
        //     canvasState.mode === CanvasMode.Inserting ||
        //     canvasState.mode === CanvasMode.Edge
        //   )
        //     return;
        //   setCanvasState({
        //     mode: CanvasMode.None,
        //   });
        // }}
        onPointerDown={(e) => {
          e.stopPropagation();

          onClick(shape);
        }}
        onPointerUp={(e) => {
          e.stopPropagation();
        }}
        size={"icon"}
        variant={isActive ? "boardActive" : "board"}
        className="p-2 rounded-xl"
      >
        {Icon && <Icon />}
      </Button>
    </li>
  );
};
