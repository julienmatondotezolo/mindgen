import { AnimatePresence, motion } from "framer-motion";
import { Save, Settings2, Trash2 } from "lucide-react";
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

  const currentMember: Member | undefined = userOrgaData?.members.filter((member) => member.userId == currentUserid)[0];

  const queryClient = useQueryClient();

  const text = useTranslations("Index");
  const textOrga = useTranslations("Organization");
  const textProfile = useTranslations("Profile");

  const [inputTitle, setInputTitle] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputTitle(e.target.value);
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

  return (
    <motion.div className="w-full" initial="hidden" animate="visible" variants={containerVariants}>
      <motion.div className="flex items-center space-x-2 pb-4 border-b dark:border-slate-800" variants={itemVariants}>
        <Settings2 className="w-6 h-6 text-primary" />
        <p className="font-bold text-lg">{uppercaseFirstLetter(text("general"))}</p>
      </motion.div>

      {isLoading && (
        <div className="space-y-4 mt-8">
          <Skeleton className="w-full h-24 bg-grey-blue animate-pulse" />
        </div>
      )}

      <AnimatePresence>
        {userOrgaData && (
          <motion.div
            className="text-sm w-full mt-8 p-6 rounded-2xl bg-[#f3f5f7] dark:bg-slate-500 dark:bg-opacity-20 border dark:border-slate-800 shadow-lg transition-shadow hover:shadow-xl"
            variants={itemVariants}
            layout
          >
            <form onSubmit={handleSubmit} className="flex flex-col pb-4 border-b dark:border-slate-800 space-y-4">
              <motion.div className="flex items-center space-x-4" variants={itemVariants}>
                <p className="font-medium">{`${textProfile("update")} ${text("name")}:`}</p>
                <div className="flex-1 relative">
                  <Input
                    type="text"
                    placeholder={`${uppercaseFirstLetter(textOrga("organization"))} ${text("name").toLowerCase()}`}
                    value={inputTitle}
                    onChange={handleTitleChange}
                    className="w-full transition-all duration-300 focus:ring-2 focus:ring-primary"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={updateOrgaMutation.isLoading}
                  className="flex items-center space-x-2 hover:scale-105 transition-transform"
                >
                  <Save className="w-4 h-4" />
                  <span>{updateOrgaMutation.isLoading ? text("loading") : uppercaseFirstLetter(text("save"))}</span>
                </Button>
              </motion.div>
            </form>

            {currentMember?.organizationRole == "OWNER" && (
              <motion.div
                className="pt-4"
                variants={itemVariants}
                onHoverStart={() => setIsHovered(true)}
                onHoverEnd={() => setIsHovered(false)}
              >
                <motion.button
                  onClick={() => handleDeleteOrga()}
                  disabled={deleteOrgaMutation.isLoading}
                  className="flex items-center space-x-2 text-red-500 hover:text-red-600 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Trash2 className={`w-4 h-4 ${isHovered ? "animate-shake" : ""}`} />
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
