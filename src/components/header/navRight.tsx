import Image from "next/image";
import { useTranslations } from "next-intl";
import React from "react";
import { useRecoilState } from "recoil";

import collaborateIcon from "@/assets/icons/collaborate.svg";
import importIcon from "@/assets/icons/import.svg";
import shareIcon from "@/assets/icons/share.svg";
import { Button } from "@/components/";
import { collaborateModalState, importModalState, shareModalState } from "@/state";

function NavRight() {
  const text = useTranslations("Index");

  const [importModal, setImportModal] = useRecoilState(importModalState);
  const [shareModal, setShareModal] = useRecoilState(shareModalState);
  const [collaborateModal, setCollaborateModal] = useRecoilState(collaborateModalState);

  const handleImportClick = () => {
    setImportModal(!importModal);
  };

  const handleShareClick = () => {
    setShareModal(!shareModal);
  };

  const handleCollaborateClick = () => {
    setCollaborateModal(!collaborateModal);
  };

  return (
    <div className="w-auto px-1 bg-white rounded-xl shadow-lg backdrop-filter backdrop-blur-lg dark:border dark:bg-slate-600 dark:bg-opacity-20 dark:border-slate-800">
      <ul className="flex flex-row items-center justify-between">
        <li className="m-1">
          <Button variant={"outline"} onClick={handleImportClick}>
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
        <li className="m-1">
          <Button onClick={handleCollaborateClick}>
            <Image
              className="mr-2"
              src={collaborateIcon}
              width="0"
              height="0"
              style={{ width: "100%", height: "auto" }}
              alt="Collaborate icon"
            />
            {text("collaborate")}
          </Button>
        </li>
      </ul>
    </div>
  );
}

export { NavRight };
