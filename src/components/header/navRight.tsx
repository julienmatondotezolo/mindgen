import { Plus } from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import React from "react";
import { useQuery } from "react-query";
import { useRecoilState } from "recoil";

import { fetchProfile } from "@/_services";
import { Collaborator, MindMapDetailsProps, ProfileProps } from "@/_types";
import collaborateIcon from "@/assets/icons/collaborate.svg";
import importIcon from "@/assets/icons/import.svg";
import shareIcon from "@/assets/icons/share.svg";
import { Button } from "@/components/";
import { collaborateModalState, importModalState, shareModalState, upgradePlanModalState } from "@/state";
import { checkPermission } from "@/utils";

const fetchUserProfile = () => fetchProfile();

function NavRight({ userMindmapDetails }: { userMindmapDetails: MindMapDetailsProps | undefined }) {
  const text = useTranslations("Index");

  const PERMISSIONS = userMindmapDetails?.connectedCollaboratorPermissions;
  const collaborators = userMindmapDetails ? userMindmapDetails?.collaborators : [];
  const MAX_COLLABORATORS_SHOWED = 3;

  const [importModal, setImportModal] = useRecoilState(importModalState);
  const [shareModal, setShareModal] = useRecoilState(shareModalState);
  const [collaborateModal, setCollaborateModal] = useRecoilState(collaborateModalState);
  const [upgradePlanModal, setUpgradePlanModal] = useRecoilState(upgradePlanModalState);
  const session = useSession();

  const handleImportClick = () => {
    setImportModal(!importModal);
  };

  const handleShareClick = () => {
    setShareModal(!shareModal);
  };

  const handleCollaborateClick = () => {
    setCollaborateModal(!collaborateModal);
  };

  const handleUpgratePlanClick = () => {
    setUpgradePlanModal(!upgradePlanModal);
  };

  const { data: userProfile } = useQuery<ProfileProps>("userProfile", fetchUserProfile, {
    enabled: session.data?.session?.user !== undefined,
  });

  return (
    <div className="w-auto px-1 bg-white rounded-xl shadow-lg backdrop-filter backdrop-blur-lg dark:border dark:bg-slate-600 dark:bg-opacity-20 dark:border-slate-800">
      <ul className="flex flex-row items-center justify-between">
        {checkPermission(PERMISSIONS, "EXPORT") && (
          <li className="m-1">
            <Button
              variant={"outline"}
              onClick={userProfile?.plan != "FREE" ? handleUpgratePlanClick : handleImportClick}
            >
              <Image
                className="mr-2 dark:invert"
                src={importIcon}
                width="0"
                height="0"
                style={{ width: "100%", height: "auto" }}
                alt="Import icon"
              />
              {text("import")}
            </Button>
          </li>
        )}
        {checkPermission(PERMISSIONS, "EXPORT") && (
          <li className="m-1">
            <Button variant={"outline"} onClick={handleShareClick}>
              <Image
                className="mr-2 dark:invert"
                src={shareIcon}
                width="0"
                height="0"
                style={{ width: "100%", height: "auto" }}
                alt="Share icon"
              />
              {text("share")}
            </Button>
          </li>
        )}
        <li className="m-1">
          <Button
            variant={collaborators!.length > 1 ? "outline" : "default"}
            onClick={userProfile?.plan != "FREE" ? handleUpgratePlanClick : handleCollaborateClick}
          >
            {collaborators?.length > 1 ? (
              collaborators?.slice(0, MAX_COLLABORATORS_SHOWED).map((collaborator: Collaborator, index: number) => (
                <figure
                  key={index}
                  className={`flex h-6 w-6 rounded-full -ml-2 border ${
                    collaborator.role == "OWNER" ? "bg-primary-color" : "bg-[#1fb865]"
                  }`}
                >
                  <p className="m-auto text-xs">{collaborator.username.substring(0, 1).toUpperCase()}</p>
                </figure>
              ))
            ) : (
              <Image
                className="mr-2"
                src={collaborateIcon}
                width="0"
                height="0"
                style={{ width: "100%", height: "auto" }}
                alt="Collaborate icon"
              />
            )}

            {collaborators?.slice(1, collaborators.length).length >= MAX_COLLABORATORS_SHOWED ? (
              <figure className="flex h-6 w-6 rounded-full -ml-2 border bg-white dark:bg-slate-800">
                <p className="m-auto text-[10px]">{`+${collaborators.length - MAX_COLLABORATORS_SHOWED}`}</p>
              </figure>
            ) : (
              <></>
            )}

            {collaborators?.length > 1 ? (
              <Plus className="p-1 ml-2 border-2 rounded-full" />
            ) : (
              <p>{text("collaborate")}</p>
            )}
          </Button>
        </li>
      </ul>
    </div>
  );
}

export { NavRight };
