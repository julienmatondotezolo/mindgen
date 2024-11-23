"use client";
import { CirclePlus } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import { Organization } from "@/_types";
import boardElement from "@/assets/images/elements.svg";
import {
  BackDropGradient,
  Button,
  GenerateMindmapDialog,
  MindmapDialog,
  OrganizationDialog,
  OrganizationSettingsDialog,
} from "@/components";
import { HeroProfile, MindGenTemplates, Navigation, OrgSidebar, RecentMindMap } from "@/components/dashboard";
import {
  generateModalState,
  modalState,
  organizationSettingsState,
  organizationState,
  selectedOrganizationState,
} from "@/state";
import { uppercaseFirstLetter } from "@/utils";

export default function Dashboard() {
  const [isOpen, setIsOpen] = useRecoilState(modalState);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useRecoilState(generateModalState);
  const [isOrganization, setOrganization] = useRecoilState(organizationState);
  const [isOrgaSettings, setOrgaSettings] = useRecoilState(organizationSettingsState);

  const selectedOrganization = useRecoilValue<Organization | undefined>(selectedOrganizationState);
  const text = useTranslations("Index");
  const textOrga = useTranslations("Organization");

  // Add loading state
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set loading to false once selectedOrganization is initialized
    setIsLoading(false);
  }, [selectedOrganization]);

  const handleClick = () => {
    setOrganization(!isOrganization);
  };

  if (isLoading) {
    return <div>Loading Organization...</div>;
  }

  return (
    <>
      <Navigation />
      <div className="relative flex justify-center pt-32">
        <BackDropGradient />
        <section className="space-y-12 max-w-7xl w-[90%]">
          <HeroProfile />
          <article className="flex justify-between">
            <div className="w-[25%]">
              <OrgSidebar />
            </div>
            {selectedOrganization ? (
              <div className="w-full space-y-12">
                <MindGenTemplates />
                <RecentMindMap />
              </div>
            ) : (
              <article className="flex flex-col items-center mt-6 space-y-6 w-full">
                <Image src={boardElement} alt="Empty" height={200} width={200} />
                <p className="text-2xl font-semibold mt-6">Create an organization to get started</p>
                <Button onClick={handleClick}>
                  <span className=" text-base mr-2">
                    <CirclePlus size={18} />
                  </span>
                  {`${uppercaseFirstLetter(text("create"))} ${textOrga("organization")}`}
                </Button>
              </article>
            )}
          </article>
        </section>
      </div>
      <MindmapDialog open={isOpen} setIsOpen={setIsOpen} update={false} />
      <GenerateMindmapDialog open={isGenerateModalOpen} setIsOpen={setIsGenerateModalOpen} update={false} />
      <OrganizationDialog open={isOrganization} setIsOpen={setOrganization} update={false} />
      <OrganizationSettingsDialog open={isOrgaSettings} setIsOpen={setOrgaSettings} update={false} />
    </>
  );
}
