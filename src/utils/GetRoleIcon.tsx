// utils/getRoleIcon.tsx
import { Crown, Shield, UserPlus, Users } from "lucide-react";
import React from "react";

interface GetRoleIconProps {
  role: string;
}

const GetRoleIcon: React.FC<GetRoleIconProps> = ({ role }) => {
  switch (role) {
    case "OWNER":
      return <Crown className="w-4 h-4" />;
    case "ADMIN":
      return <Shield className="w-4 h-4" />;
    case "MEMBER":
      return <Users className="w-4 h-4" />;
    case "GUEST":
      return <UserPlus className="w-4 h-4" />;
    default:
      return null;
  }
};

export { GetRoleIcon };
