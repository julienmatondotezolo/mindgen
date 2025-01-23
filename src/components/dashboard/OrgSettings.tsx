import { AnimatePresence, motion, useAnimation } from "framer-motion";
import { Save, Settings2, Trash2, Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "react-query";
import { useRecoilState, useSetRecoilState } from "recoil";

import { deleteOrganizationById, updateOrganization } from "@/_services";
import { CustomSession, Member } from "@/_types";
import { Organization } from "@/_types/Organization";
import { Button, Input, Skeleton } from "@/components/ui";
import { organizationSettingsState, selectedOrganizationState } from "@/state";
import { uppercaseFirstLetter } from "@/utils";

interface OrgProps {
  userOrgaData: Organization | undefined;
  isLoading: boolean;
}

function OrgSettings({ userOrgaData, isLoading }: OrgProps) {
  const session = useSession();
  const safeSession: any = session ? (session as unknown as CustomSession) : null;
  const currentUserid = safeSession?.data.session?.user.id;
  const controls = useAnimation();

  const currentMember: Member | undefined = userOrgaData?.members.filter((member) => member.userId == currentUserid)[0];

  const queryClient = useQueryClient();

  const text = useTranslations("Index");
  const textOrga = useTranslations("Organization");
  const textProfile = useTranslations("Profile");

  const [inputTitle, setInputTitle] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputTitle(e.target.value);
    controls.start({
      scale: [1, 1.02, 1],
      transition: { duration: 0.3 }
    });
  };

  const [selectedOrga, setSelectedOrga] = useRecoilState<Organization | undefined>(selectedOrganizationState);
  const setOrgaSettings = useSetRecoilState(organizationSettingsState);

  useEffect(() => {
    if (userOrgaData) setInputTitle(userOrgaData.name);
  }, [userOrgaData]);

  const updateOrgaMutation = useMutation(updateOrganization, {
    onSuccess: (updatedOrga) => {
      setSelectedOrga(updatedOrga);
      queryClient.invalidateQueries("userOrgaById");
      queryClient.invalidateQueries("userOrganizations");
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newOrgaObject = {
      name: inputTitle,
      type: "PERSONAL",
    };

    updateOrgaMutation.mutate({
      organizationId: selectedOrga!.id,
      organizationObject: newOrgaObject,
    });
  };

  const deleteOrgaMutation = useMutation(deleteOrganizationById, {
    onSuccess: async () => {
      await queryClient.invalidateQueries("userOrgaById");
      await queryClient.invalidateQueries("userOrganizations");
    },
  });

  const handleDeleteOrga = async () => {
    try {
      deleteOrgaMutation.mutate({
        organizationId: selectedOrga!.id,
      });

      localStorage.removeItem("selected-organization");
      setOrgaSettings(false);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`An error has occurred: ${error.message}`);
      }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  const glowVariants = {
    initial: { opacity: 0 },
    animate: { 
      opacity: [0, 0.5, 0],
      scale: [1, 1.2, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div 
      className="w-full relative"
      initial="hidden" 
      animate="visible" 
      variants={containerVariants}
    >
      <motion.div 
        className="flex items-center space-x-2 pb-4 mb-8 border-b dark:border-slate-800 relative" 
        variants={itemVariants}
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-primary-color/20 to-secondary-color/20 rounded-lg filter blur-xl"
          variants={glowVariants}
          initial="initial"
          animate="animate"
        />
        <Settings2 className="w-6 h-6 text-primary relative z-10" />
        <p className="font-bold text-lg relative z-10">{uppercaseFirstLetter(text("general"))}</p>
      </motion.div>

      {isLoading && (
        <div className="space-y-4 mt-8">
          <Skeleton className="w-full h-24 bg-grey-blue/30 animate-pulse rounded-xl" />
        </div>
      )}

      <AnimatePresence>
        {userOrgaData && (
          <motion.div
            className="text-sm w-full mt-8 p-8 rounded-2xl bg-white/50 dark:bg-slate-500/10 backdrop-blur-lg border-2 border-primary-color/10 dark:border-slate-800 shadow-lg hover:shadow-xl hover:border-primary-color/30 transition-all duration-500"
            variants={itemVariants}
            layout
            animate={controls}
          >
            <form onSubmit={handleSubmit} className="flex flex-col pb-6 border-b dark:border-slate-800 space-y-6">
              <motion.div className="flex items-center space-x-4" variants={itemVariants}>
                <Sparkles className="w-5 h-5 text-primary-color" />
                <p className="font-medium">{`${textProfile("update")} ${text("name")}:`}</p>
                <div className="flex-1 relative">
                  <Input
                    type="text"
                    placeholder={`${uppercaseFirstLetter(textOrga("organization"))} ${text("name").toLowerCase()}`}
                    value={inputTitle}
                    onChange={handleTitleChange}
                    className="w-full transition-all duration-300 focus:ring-2 focus:ring-primary bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-2 border-primary-color/10 hover:border-primary-color/30"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={updateOrgaMutation.isLoading}
                  className="bg-gradient-to-r from-primary-color to-secondary-color hover:opacity-90 transition-all duration-300 group"
                >
                  <Save className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                  <span>{updateOrgaMutation.isLoading ? text("loading") : uppercaseFirstLetter(text("save"))}</span>
                </Button>
              </motion.div>
            </form>

            {currentMember?.organizationRole == "OWNER" && (
              <motion.div
                className="pt-6"
                variants={itemVariants}
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
              >
                <motion.button
                  onClick={() => handleDeleteOrga()}
                  disabled={deleteOrgaMutation.isLoading}
                  className="flex items-center space-x-2 text-red-500 hover:text-red-600 transition-all duration-300 group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Trash2 className={`w-4 h-4 ${isHovered ? "animate-shake" : ""} group-hover:rotate-12 transition-transform`} />
                  <span className="font-medium">
                    {deleteOrgaMutation.isLoading
                      ? `${uppercaseFirstLetter(text("loading"))}...`
                      : `${uppercaseFirstLetter(text("remove"))} ${textOrga("organization")}`}
                  </span>
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export { OrgSettings };
