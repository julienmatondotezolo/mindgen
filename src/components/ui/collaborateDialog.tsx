import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Crown, Eye, Loader2, Shield, UserPlus, Users, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import React, { FC, useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "react-query";

import { inviteAllMembers, removeMemberById, updateMembers } from "@/_services";
import { CustomSession, DialogProps, Member, MindMapDetailsProps, MindmapRole } from "@/_types";
import { Button, Input } from "@/components";
import { useSyncMutation } from "@/hooks";
import { checkPermission } from "@/utils";

interface CollaborateDialogProps extends DialogProps {
  mindmapId: string;
  userMindmap: MindMapDetailsProps;
}

const CollaborateDialog: FC<CollaborateDialogProps> = ({ open, setIsOpen, mindmapId, userMindmap }) => {
  const session: any = useSession();
  const safeSession = session ? (session as unknown as CustomSession) : null;

  const text = useTranslations("Index");
  const memberText = useTranslations("Member");
  const modalRef = useRef<HTMLDivElement>(null);

  const [inviteMembers, setInviteMembers] = useState({ mindmapId, username: "", role: "ADMIN" });
  const [members, setMembers] = useState<Member[] | undefined>(userMindmap.members);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notFoundUsers, setNotFoundUsers] = useState([]);
  const [currentRole, setCurrentRole] = useState("");
  const [activeTab, setActiveTab] = useState("members");

  const queryClient = useQueryClient();
  const PERMISSIONS = userMindmap.connectedMemberPermissions;
  const membersLength = userMindmap ? userMindmap.members.length - 1 : 0;
  const mindmapVisibility = userMindmap.visibility;

  // Animation variants
  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const modalVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        duration: 0.5,
        stiffness: 100,
      },
    },
    exit: {
      scale: 0.8,
      opacity: 0,
      transition: {
        duration: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.3,
      },
    }),
  };

  // Existing mutation hooks
  const fetchInviteMembers = useSyncMutation(inviteAllMembers, {
    onSuccess: (response: any) => {
      setNotFoundUsers([]);
      if (response.notFoundUsernames.length > 0 && response.notFoundUsernames != null)
        setNotFoundUsers(response.notFoundUsernames);
      queryClient.invalidateQueries("mindmap");
    },
  });

  const fetchUpdateCollaborator = useMutation(updateMembers, {
    onSuccess: () => {
      queryClient.invalidateQueries("mindmap");
      setIsDeleting(false);
    },
  });

  const fetchRemoveMemberById = useMutation(removeMemberById, {
    onSuccess: () => {
      queryClient.invalidateQueries("mindmap");
      setIsDeleting(false);
    },
  });

  // Existing handlers
  const handleRemoveMember = async (memberId: string) => {
    if (mindmapVisibility === "PUBLIC") return;

    try {
      setIsDeleting(true);
      fetchRemoveMemberById.mutate({
        session: safeSession,
        mindmapId: mindmapId,
        membersToDelete: {
          memberIds: [memberId],
        },
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleClose = () => {
    queryClient.invalidateQueries("mindmap");
    setIsOpen(false);
  };

  const handleMember = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInviteMembers({ ...inviteMembers, username: e.target.value });
  };

  const handleMemberRole = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setInviteMembers({ ...inviteMembers, role: e.target.value });
  };

  const handleInviteMembers = async () => {
    if (!inviteMembers.username) return;

    try {
      const mappedmembers = {
        mindmapId,
        invitedmembers: [
          {
            username: inviteMembers.username,
            role: inviteMembers.role || "ADMIN",
          },
        ],
      };

      fetchInviteMembers.mutate(mappedmembers);
    } catch (error) {
      console.error(error);
    }

    setInviteMembers({ mindmapId, username: "", role: "" });
  };

  const handleMemberRoleChange = (e: React.ChangeEvent<HTMLSelectElement>, memberIndex: number) => {
    const membersArray = members as Member[];

    if (memberIndex !== -1) {
      const updatedmembers = [...membersArray];

      updatedmembers[memberIndex].mindmapRole = e.target.value as MindmapRole;
      setMembers(updatedmembers);
    }
  };

  const handleSave = async () => {
    if (members) {
      const memberRoles = members.reduce((acc: any, item) => {
        acc[item.memberId] = item.mindmapRole;
        return acc;
      }, {});

      await fetchUpdateCollaborator.mutateAsync({
        session: safeSession,
        mindmapId: mindmapId,
        membersToUpdate: {
          memberRoles: { ...memberRoles },
        },
      });

      handleClose();
    }
  };

  // Effects
  useEffect(() => {
    const userId = session.data?.session?.user.id;

    if (userId && userMindmap) {
      const collaborator = userMindmap?.members.filter((c) => c.userId == userId)[0];

      setCurrentRole(collaborator.mindmapRole);
    }
  }, [currentRole, session, userMindmap]);

  useEffect(() => {
    if (open) queryClient.invalidateQueries("mindmap");
  }, [open, queryClient]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!modalRef.current?.contains(event.target as Node)) {
        handleClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Shield className="w-4 h-4" />;
      case "CREATOR":
        return <Crown className="w-4 h-4" />;
      case "CONTRIBUTOR":
        return <UserPlus className="w-4 h-4" />;
      default:
        return <Eye className="w-4 h-4" />;
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
        >
          <motion.div
            ref={modalRef}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-11/12 md:w-4/12 bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden"
          >
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">{text("collaborate")}</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Tabs */}
              <div className="flex space-x-4 border-b dark:border-slate-700">
                <button
                  onClick={() => setActiveTab("members")}
                  className={`pb-2 px-1 transition-all ${
                    activeTab === "members" ? "border-b-2 border-primary-color text-primary-color" : "text-gray-500"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>{memberText("members")}</span>
                  </div>
                </button>
                {checkPermission(PERMISSIONS, "UPDATE") && (
                  <button
                    onClick={() => setActiveTab("invite")}
                    className={`pb-2 px-1 transition-all ${
                      activeTab === "invite" ? "border-b-2 border-primary-color text-primary-color" : "text-gray-500"
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <UserPlus className="w-4 h-4" />
                      <span>{memberText("invite")}</span>
                    </div>
                  </button>
                )}
              </div>

              {/* Content */}
              <div className="space-y-4">
                {activeTab === "invite" && checkPermission(PERMISSIONS, "UPDATE") && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                    <div className="flex flex-col gap-4">
                      <Input
                        value={inviteMembers.username}
                        onChange={handleMember}
                        placeholder={memberText("addMember")}
                        className="w-full"
                      />
                      <div className="flex gap-4">
                        <select
                          className="flex-1 bg-transparent border rounded-lg px-4 py-2 text-sm dark:bg-slate-800 dark:border-slate-700"
                          value={inviteMembers.role}
                          onChange={handleMemberRole}
                        >
                          <option value="ADMIN" className="flex items-center gap-2">
                            {memberText("admin")}
                          </option>
                          <option value="CONTRIBUTOR">{memberText("contributor")}</option>
                          <option value="VIEWER">{memberText("viewer")}</option>
                        </select>
                        <Button onClick={handleInviteMembers} className="flex items-center gap-2">
                          <UserPlus className="w-4 h-4" />
                          {text("add")}
                        </Button>
                      </div>
                    </div>

                    {notFoundUsers.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex items-center space-x-2 text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg"
                      >
                        <AlertCircle className="w-4 h-4" />
                        <span>{notFoundUsers.join(", ")} not found</span>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {activeTab === "members" && (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {members?.map((member: Member, index) => (
                      <motion.div
                        key={member.memberId}
                        custom={index}
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                        className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${
                              member.mindmapRole === "CREATOR" ? "bg-primary-color" : "bg-[#1fb865]"
                            }`}
                          >
                            {member.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{member.username}</p>
                            <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                              {getRoleIcon(member.mindmapRole)}
                              <span>{memberText(member.mindmapRole.toLowerCase())}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          {member.organizationRole === "OWNER" ? (
                            <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg">
                              <Crown className="w-4 h-4" />
                              <span className="text-sm">{memberText("owner")}</span>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center gap-2 bg-transparent border rounded-lg px-3 py-1.5 dark:bg-slate-800 dark:border-slate-700">
                                {getRoleIcon(members[index]?.mindmapRole)}
                                <select
                                  className="bg-transparent text-sm outline-none"
                                  value={members[index]?.mindmapRole}
                                  onChange={(e) => handleMemberRoleChange(e, index)}
                                  disabled={!checkPermission(PERMISSIONS, "UPDATE")}
                                >
                                  <option value="ADMIN">{memberText("admin")}</option>
                                  <option value="CONTRIBUTOR">{memberText("contributor")}</option>
                                  <option value="VIEWER">{memberText("viewer")}</option>
                                </select>
                              </div>

                              {checkPermission(PERMISSIONS, "DELETE") && mindmapVisibility === "PRIVATE" && (
                                <Button
                                  size="sm"
                                  onClick={() => handleRemoveMember(member.memberId)}
                                  disabled={isDeleting}
                                >
                                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : text("remove")}
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              {checkPermission(PERMISSIONS, "UPDATE") && membersLength > 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-end pt-4 border-t dark:border-slate-700"
                >
                  <Button onClick={handleSave} disabled={fetchUpdateCollaborator.isLoading}>
                    {fetchUpdateCollaborator.isLoading ? (
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{text("saving")}...</span>
                      </div>
                    ) : (
                      text("save")
                    )}
                  </Button>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export { CollaborateDialog };
