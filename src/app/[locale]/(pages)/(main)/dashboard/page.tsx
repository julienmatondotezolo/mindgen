"use client";
import { CirclePlus, LayoutDashboard, Star } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import { Organization } from "@/_types";
import boardElement from "@/assets/images/elements.svg";
import {
  BackDropGradient,
  Button,
  CurrentPlan,
  GenerateMindmapDialog,
  MindmapDialog,
  OrganizationDialog,
  OrganizationSettingsDialog,
} from "@/components";
import { LeftBoards, MindGenTemplates, Navigation, OrgSidebar, RecentMindMap } from "@/components/dashboard";
import { Link } from "@/navigation";
import {
  generateModalState,
  modalState,
  organizationSettingsState,
  organizationState,
  selectedOrganizationState,
} from "@/state";
import { uppercaseFirstLetter } from "@/utils";

export default function Dashboard() {
  const text = useTranslations("Index");
  const textOrga = useTranslations("Organization");
  const recentMindmapText = useTranslations("Dashboard");

  const [isOpen, setIsOpen] = useRecoilState(modalState);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useRecoilState(generateModalState);
  const [isOrganization, setOrganization] = useRecoilState(organizationState);
  const [isOrgaSettings, setOrgaSettings] = useRecoilState(organizationSettingsState);

  const selectedOrganization = useRecoilValue<Organization | undefined>(selectedOrganizationState);

  const searchParams = useSearchParams();

  const favourites = searchParams.get("favourites");

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
          {/* <HeroProfile /> */}
          <article className="flex justify-between">
            <div className="w-[25%]">
              <div className="w-full pr-8 space-y-8">
                <OrgSidebar />
                <div className="w-full space-y-2">
                  <Button
                    variant={favourites ? "ghost" : "boardClicked"}
                    asChild
                    size="lg"
                    className="justify-start px-2 w-full"
                  >
                    <Link href="/dashboard">
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Team Boards
                    </Link>
                  </Button>
                  <Button
                    variant={favourites ? "boardClicked" : "ghost"}
                    asChild
                    size="lg"
                    className="justify-start px-2 w-full"
                  >
                    <Link
                      href={{
                        pathname: "/dashboard",
                        query: {
                          favourites: "true",
                        },
                      }}
                    >
                      <Star className="h-4 w-4 mr-2" />
                      Favourite Boards
                    </Link>
                  </Button>
                </div>
                <CurrentPlan />
              </div>
            </div>
            {selectedOrganization ? (
              <div className="w-full space-y-12">
                <MindGenTemplates />
                <section className="flex flex-wrap items-center justify-between space-y-4">
                  <p className="text-xl font-medium dark:text-white">{recentMindmapText("myRecentBoards")}</p>
                  <LeftBoards />
                </section>
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
