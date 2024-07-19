import { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ToolButtonProps {
  icon: LucideIcon;
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
}

export const ToolButton = ({ icon: Icon, onClick, isActive, disabled }: ToolButtonProps) => (
  <li className="m-1">
    <Button
      disabled={disabled}
      onClick={onClick}
      size="icon"
      variant={isActive ? "boardActive" : "board"}
      className="p-2 rounded-xl"
    >
      <Icon />
    </Button>
  </li>
);
