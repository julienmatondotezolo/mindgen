"use client";

import Image from "next/image";
import React from "react";

import documentIcon from "@/assets/icons/document.svg";
import { Button } from "@/components/ui";

function OpenOurNewMindmap() {
  const size = 15;

  return (
    <ul className="inline-block space-x-4">
      <li className="float-left">
        <Button variant={"outline"}>
          <Image className="mr-2" src={documentIcon} height={size} width={size} alt="document icon" />
          Open mind map
        </Button>
      </li>
      <li className="float-left">
        <Button>
          <span className=" text-base mr-2">+</span> New mind map
        </Button>
      </li>
    </ul>
  );
}

export { OpenOurNewMindmap };
