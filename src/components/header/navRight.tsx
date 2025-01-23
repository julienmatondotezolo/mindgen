import { AnimatePresence, motion } from "framer-motion";
import { Import, Plus, Share2, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import React from "react";
import { useQuery } from "react-query";
import { useSetRecoilState } from "recoil";

import { fetchProfile } from "@/_services";
import { CustomSession, Member, MindMapDetailsProps, ProfileProps } from "@/_types";
import { Button } from "@/components/";
import { collaborateModalState, importModalState, shareModalState, upgradePlanModalState } from "@/state";
import { checkPermission } from "@/utils";

function NavRight({ userMindmapDetails }: { userMindmapDetails: MindMapDetailsProps | undefined }) {
  const text = useTranslations("Index");
  const session = useSession();

  const PERMISSIONS = userMindmapDetails?.connectedMemberPermissions;
  const members = userMindmapDetails ? userMindmapDetails?.members : [];
  const MAX_MEMBERS_SHOWED = 3;

  const setImportModal = useSetRecoilState(importModalState);
  const setShareModal = useSetRecoilState(shareModalState);
  const setCollaborateModal = useSetRecoilState(collaborateModalState);
  const setUpgradePlanModal = useSetRecoilState(upgradePlanModalState);

  const safeSession = session ? (session as unknown as CustomSession) : null;
  const fetchUserProfile = () => fetchProfile({ session: safeSession });
  const { data: userProfile } = useQuery<ProfileProps>("userProfile", fetchUserProfile);

  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const buttonVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
    hover: {
      scale: 1.02,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10,
      },
    },
  };

  const memberVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: (i: number) => ({
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 200,
        delay: i * 0.05,
      },
    }),
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-auto px-3 py-2 bg-white/90 rounded-2xl shadow-lg backdrop-blur-xl dark:bg-slate-800/90 dark:border dark:border-slate-700/50"
    >
      <ul className="flex flex-row items-center gap-3">
        {checkPermission(PERMISSIONS, "IMPORT") && (
          <motion.li variants={buttonVariants} whileHover="hover">
            <Button
              variant="ghost"
              onClick={userProfile?.plan == "FREE" ? () => setUpgradePlanModal(true) : () => setImportModal(true)}
              className="relative group px-5 py-2 hover:bg-primary-color/10 transition-all duration-300"
            >
              <Import className="w-4 h-4 mr-2 transition-all duration-300 group-hover:scale-110" />
              <span className="font-medium">{text("import")}</span>
            </Button>
          </motion.li>
        )}

        {checkPermission(PERMISSIONS, "EXPORT") && (
          <motion.li variants={buttonVariants} whileHover="hover">
            <Button
              variant="ghost"
              onClick={() => setShareModal(true)}
              className="relative group px-5 py-2 hover:bg-primary-color/10 transition-all duration-300"
            >
              <Share2 className="w-4 h-4 mr-2 transition-all duration-300 group-hover:scale-110" />
              <span className="font-medium">{text("share")}</span>
            </Button>
          </motion.li>
        )}

        <motion.li variants={buttonVariants} whileHover="hover">
          <Button
            variant={members!.length > 1 ? "ghost" : "default"}
            onClick={
              checkPermission(PERMISSIONS, "MANAGE_ROLES")
                ? () => setCollaborateModal(true)
                : () => setUpgradePlanModal(true)
            }
            className="relative group px-5 py-2 transition-all duration-300"
          >
            <div className="flex items-center">
              {members?.length > 1 ? (
                <div className="flex -space-x-4 mr-3">
                  <AnimatePresence>
                    {members?.slice(0, MAX_MEMBERS_SHOWED).map((collaborator: Member, index: number) => (
                      <motion.div
                        key={index}
                        custom={index}
                        variants={memberVariants}
                        initial="hidden"
                        animate="visible"
                        whileHover={{ y: -2 }}
                        className={`flex h-8 w-8 rounded-full border-2 border-white dark:border-slate-800 shadow-md ${
                          collaborator.mindmapRole == "CREATOR" ? "bg-primary-color" : "bg-[#1fb865]"
                        }`}
                      >
                        <span className="m-auto text-sm font-semibold text-white">
                          {collaborator.username.substring(0, 1).toUpperCase()}
                        </span>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <Users className="w-4 h-4 mr-2 transition-all duration-300 group-hover:scale-110" />
              )}

              {members?.slice(1, members.length).length >= MAX_MEMBERS_SHOWED && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  whileHover={{ y: -2 }}
                  className="flex h-8 w-8 rounded-full border-2 border-white dark:border-slate-800 bg-white dark:bg-slate-700 shadow-md"
                >
                  <span className="m-auto text-sm font-medium">{`+${members.length - MAX_MEMBERS_SHOWED}`}</span>
                </motion.div>
              )}

              {members?.length > 1 ? (
                <Plus className="w-4 h-4 ml-3 transition-all duration-300 group-hover:rotate-180" />
              ) : (
                <span className="font-medium">{text("collaborate")}</span>
              )}
            </div>
          </Button>
        </motion.li>
      </ul>
    </motion.div>
  );
}

export { NavRight };
