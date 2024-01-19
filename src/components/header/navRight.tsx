import Image from "next/image";
import React from "react";

import collaborateIcon from "@/assets/icons/collaborate.svg";
import importIcon from "@/assets/icons/import.svg";
import shareIcon from "@/assets/icons/share.svg";
import { Button } from "@/components/";

function NavRight() {
  return (
    <div className="w-auto px-1 bg-white rounded-xl shadow-lg">
      <ul className="flex flex-row items-center justify-between">
        <li className="m-1">
          <Button variant={"outline"}>
            <Image
              className="mr-2"
              src={importIcon}
              width="0"
              height="0"
              style={{ width: "100%", height: "auto" }}
              alt="Import icon"
            />
            Import
          </Button>
        </li>
        <li className="m-1">
          <Button variant={"outline"}>
            <Image
              className="mr-2"
              src={shareIcon}
              width="0"
              height="0"
              style={{ width: "100%", height: "auto" }}
              alt="Share icon"
            />
            Share
          </Button>
        </li>
        <li className="m-1">
          <Button>
            <Image
              className="mr-2"
              src={collaborateIcon}
              width="0"
              height="0"
              style={{ width: "100%", height: "auto" }}
              alt="Collaborate icon"
            />
            Collaborate
          </Button>
        </li>
      </ul>
    </div>
  );
}

export { NavRight };
