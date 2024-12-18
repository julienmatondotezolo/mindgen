import { Plus } from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import React from "react";
import { useQuery } from "react-query";
import { useRecoilState } from "recoil";

import { fetchProfile } from "@/_services";
import { CustomSession, Member, MindMapDetailsProps, ProfileProps } from "@/_types";
import collaborateIcon from "@/assets/icons/collaborate.svg";
import importIcon from "@/assets/icons/import.svg";
import shareIcon from "@/assets/icons/share.svg";
import { Button } from "@/components/";
import { collaborateModalState, importModalState, shareModalState, upgradePlanModalState } from "@/state";
import { checkPermission } from "@/utils";

function NavRight({ userMindmapDetails }: { userMindmapDetails: MindMapDetailsProps | undefined }) {
  const text = useTranslations("Index");
  const session = useSession();

  const PERMISSIONS = userMindmapDetails?.connectedMemberPermissions;
  const members = userMindmapDetails ? userMindmapDetails?.members : [];
  const MAX_MEMBERS_SHOWED = 3;

  const [importModal, setImportModal] = useRecoilState(importModalState);
  const [shareModal, setShareModal] = useRecoilState(shareModalState);
  const [collaborateModal, setCollaborateModal] = useRecoilState(collaborateModalState);
  const [upgradePlanModal, setUpgradePlanModal] = useRecoilState(upgradePlanModalState);

  const safeSession = session ? (session as unknown as CustomSession) : null;

  const fetchUserProfile = () => fetchProfile({ session: safeSession });

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

  const { data: userProfile } = useQuery<ProfileProps>("userProfile", fetchUserProfile);

  return (
    <div className="w-auto px-1 bg-white rounded-xl shadow-lg backdrop-filter backdrop-blur-lg dark:border dark:bg-slate-600 dark:bg-opacity-20 dark:border-slate-800">
      <ul className="flex flex-row items-center justify-between">
        {checkPermission(PERMISSIONS, "EXPORT") && (
          <li className="m-1">
            <Button
              variant={"outline"}
              onClick={userProfile?.plan != "FREE" ? handleImportClick : handleUpgratePlanClick}
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
            variant={members!.length > 1 ? "outline" : "default"}
            onClick={userProfile?.plan != "FREE" ? handleCollaborateClick : handleUpgratePlanClick}
          >
            {members?.length > 1 ? (
              members?.slice(0, MAX_MEMBERS_SHOWED).map((collaborator: Member, index: number) => (
                <figure
                  key={index}
                  className={`flex h-6 w-6 rounded-full -ml-2 text-white border ${
                    collaborator.mindmapRole == "CREATOR" ? "bg-primary-color" : "bg-[#1fb865]"
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

            {members?.slice(1, members.length).length >= MAX_MEMBERS_SHOWED && (
              <figure className="flex h-6 w-6 rounded-full -ml-2 border bg-white dark:bg-slate-800">
                <p className="m-auto text-[10px]">{`+${members.length - MAX_MEMBERS_SHOWED}`}</p>
              </figure>
            )}

            {members?.length > 1 ? <Plus className="p-1 ml-2 border-2 rounded-full" /> : <p>{text("collaborate")}</p>}
          </Button>
        </li>
      </ul>
    </div>
  );
}

export { NavRight };
