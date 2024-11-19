import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";
import { useSetRecoilState } from "recoil";

import { CanvasMode } from "@/_types";
import { Button } from "@/components/ui/button";
import { canvasStateAtom } from "@/state";

interface ToolButtonProps {
  icon?: LucideIcon;
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  children?: ReactNode;
}

export const ToolButton = ({ icon: Icon, onClick, isActive, disabled, children }: ToolButtonProps) => {
  const setCanvasState = useSetRecoilState(canvasStateAtom);

  return (
    <li className="m-1">
      <Button
        disabled={disabled}
        onMouseEnter={() => {
          setCanvasState({
            mode: CanvasMode.Tooling,
          });
        }}
        onMouseLeave={() => {
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
