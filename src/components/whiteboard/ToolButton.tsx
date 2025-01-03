import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import { CanvasMode } from "@/_types";
import { Button } from "@/components/ui/button";
import { activeLayersAtom, canvasStateAtom } from "@/state";

interface ToolButtonProps {
  icon?: LucideIcon;
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children?: ReactNode;
}

export const ToolButton = ({ icon: Icon, onClick, isActive, disabled, children }: ToolButtonProps) => {
  const [canvasState, setCanvasState] = useRecoilState(canvasStateAtom);
  const allActiveLayers = useRecoilValue(activeLayersAtom);

  return (
    <li className="m-1 cursor-pointer">
      <Button
        disabled={disabled}
        onMouseEnter={() => {
          setCanvasState({
            mode: CanvasMode.Tooling,
          });
        }}
        onMouseLeave={() => {
          // If layer already selected go back to LayerSelected mode
          if (allActiveLayers.length > 0) {
            setCanvasState({
              mode: CanvasMode.LayerSelected,
            });
            return;
          }

          if (
            canvasState.mode === CanvasMode.Grab ||
            canvasState.mode === CanvasMode.Inserting ||
            canvasState.mode === CanvasMode.Edge
          )
            return;
          setCanvasState({
            mode: CanvasMode.None,
          });
        }}
        onPointerDown={(e) => {
          e.stopPropagation();

          onClick();
        }}
        onPointerUp={(e) => {
          e.stopPropagation();
        }}
        size={"icon"}
        variant={isActive ? "boardActive" : "board"}
        className="p-2 rounded-xl"
      >
        {Icon && <Icon />}
        {children && <span>{children}</span>}
      </Button>
    </li>
  );
};
