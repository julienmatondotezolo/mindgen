/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { FC, useEffect, useRef } from "react";
import { useQuery } from "react-query";
import { useRecoilValue } from "recoil";

import { getOrganizationById } from "@/_services";
import { Organization } from "@/_types";
import { MindMapDialogProps } from "@/_types/MindMapDialogProps";
import { OrgMembers, OrgSettings } from "@/components/dashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { memberToDeleteState, organizationSettingsState, selectedOrganizationState } from "@/state";
import { uppercaseFirstLetter } from "@/utils";

const OrganizationSettingsDialog: FC<MindMapDialogProps> = ({ open, setIsOpen }) => {
  const text = useTranslations("Index");
  const textOrga = useTranslations("Organization");
  const modalRef = useRef<HTMLDivElement>(null);
  const memberToDelete = useRecoilValue(memberToDeleteState);

  const triggerStyle = `w-full p-2 px-4 rounded-xl bg-[#f3f5f7] dark:bg-slate-500 dark:bg-opacity-20 hover:bg-gray-200 dark:hover:bg-gray-600`;

  const handleClose = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    if (memberToDelete) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!modalRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [memberToDelete]);

  const isOrgaSettings = useRecoilValue(organizationSettingsState);

  const selectedOrga = useRecoilValue<Organization | undefined>(selectedOrganizationState);

  const fetchOrgaById = () => getOrganizationById({ organizationId: selectedOrga!.id });

  const { isLoading, data: userOrgaData } = useQuery("userOrgaById", fetchOrgaById, {
    enabled: isOrgaSettings,
  });

  return (
    <div
      ref={modalRef}
      className={`overflow-hidden ${
        open ? "block" : "hidden"
      } fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 sm:w-11/12 md:w-7/12 h-5/6 bg-white border-2 p-6 space-y-8 rounded-xl shadow-lg backdrop-filter backdrop-blur-lg dark:bg-slate-900 dark:bg-opacity-70 dark:shadow-slate-900 dark:border-slate-800`}
    >
      <p className="font-bold text-xl">{`${uppercaseFirstLetter(text("settings"))} ${textOrga("organization")}`}</p>
      <Tabs defaultValue="general" className="flex flex-wrap justify-between w-full h-[90%]">
        <TabsList className="flex flex-col w-[20%] h-max space-y-4">
          <TabsTrigger className={triggerStyle} value="general">
            <p>{uppercaseFirstLetter(text("general"))}</p>
          </TabsTrigger>
          <TabsTrigger className={triggerStyle} value="members">
            <p>{uppercaseFirstLetter(text("members"))}</p>
          </TabsTrigger>
          {/*           <TabsTrigger className={triggerStyle} value="invitation">
            <p>{uppercaseFirstLetter(text("invitation"))}</p>
          </TabsTrigger> */}
        </TabsList>
        <TabsContent value="general" className="w-[70%]">
          <OrgSettings userOrgaData={userOrgaData} isLoading={isLoading} />
        </TabsContent>
        <TabsContent value="members" className="w-[70%]">
          <OrgMembers userOrgaData={userOrgaData} isLoading={isLoading} />
        </TabsContent>
        {/*         <TabsContent value="invitation" className="w-[70%]">
          <OrgInvitation />
        </TabsContent> */}
      </Tabs>
      <X size={20} onClick={handleClose} className="cursor-pointer absolute right-5 top-0" />
    </div>
  );
};

export { OrganizationSettingsDialog };
