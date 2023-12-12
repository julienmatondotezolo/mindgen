import Image from "next/image";
import React from "react";

import collaborateIcon from "@/assets/icons/collaborate.svg";
import importIcon from "@/assets/icons/import.svg";
import shareIcon from "@/assets/icons/share.svg";
import { Button } from "@/components/";

function NavRight() {
  const size = 15;

  return (
    <div className="w-auto px-1 bg-white rounded-xl shadow-lg">
      <ul className="flex flex-row items-center justify-between">
        <li className="m-1">
          <Button variant={"outline"}>
            <Image className="mr-2" src={importIcon} height={size} width={size} alt="Import icon" />
            Import
          </Button>
        </li>
        <li className="m-1">
          <Button variant={"outline"}>
            <Image className="mr-2" src={shareIcon} height={size / 1.2} width={size / 1.2} alt="Share icon" />
            Share
          </Button>
        </li>
        <li className="m-1">
          <Button variant={"outline"}>
            <Image className="mr-2" src={collaborateIcon} height={size} width={size} alt="Collaborate icon" />
            Collaborate
          </Button>
        </li>
      </ul>
    </div>
  );
}

export default NavRight;
