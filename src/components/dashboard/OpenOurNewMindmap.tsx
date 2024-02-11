"use client";

import Image from "next/image";
import React, { useState } from "react";

import documentIcon from "@/assets/icons/document.svg";
import { Button } from "@/components/ui";

import { MindmapDialog } from "../ui/mindmapDialog";

function OpenOurNewMindmap() {
  const size = 15;

  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <ul className="inline-block space-x-4">
        <li className="float-left dark:text-white">
          <Button variant={"outline"}>
            <Image className="mr-2" src={documentIcon} height={size} alt="document icon" />
            <p className="dark:text-white">Open mind map</p>
          </Button>
        </li>
        <li className="float-left">
          <Button onClick={handleClick}>
            <span className=" text-base mr-2">+</span> New mind map
          </Button>
        </li>
      </ul>
      <MindmapDialog title="HELLO" description="" open={isOpen} setIsOpen={setIsOpen} update={false} />
    </>
  );
}

export { OpenOurNewMindmap };
