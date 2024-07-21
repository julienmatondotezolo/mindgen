/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

interface HandleButtonProps {
  icon: LucideIcon;
  onClick: (e: React.MouseEventHandler) => void;
  style: any;
  isActive?: boolean;
  disabled?: boolean;
}

export const HandleButton = ({ icon: Icon, onClick, style, isActive, disabled }: HandleButtonProps) => (
  <li className="m-1">
    <Button
      disabled={disabled}
      style={style}
      onClick={onClick}
      size="icon"
      variant={isActive ? "boardActive" : "board"}
      className="p-2 rounded-xl"
    >
      <Icon />
    </Button>
  </li>
);
