"use client";
import Image from "next/image";
import { useTranslations } from "next-intl";
import React from "react";
import { useRecoilState } from "recoil";

import documentIcon from "@/assets/icons/document.svg";
import { Button } from "@/components/ui";
import { modalState } from "@/recoil";
import { uppercaseFirstLetter } from "@/utils";

function OpenOurNewMindmap() {
  const text = useTranslations("Index");

  const size = 15;

  const [isOpen, setIsOpen] = useRecoilState(modalState);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <ul className="inline-block space-x-4">
        <li className="float-left dark:text-white">
          <Button variant={"outline"}>
            <Image className="mr-2 dark:invert" src={documentIcon} height={size} alt="document icon" />
            <p className="dark:text-white">{uppercaseFirstLetter(text("open"))} mind map</p>
          </Button>
        </li>
        <li className="float-left">
          <Button onClick={handleClick}>
            <span className=" text-base mr-2">+</span> {uppercaseFirstLetter(text("new"))} mind map
          </Button>
        </li>
      </ul>
    </>
  );
}

export { OpenOurNewMindmap };
