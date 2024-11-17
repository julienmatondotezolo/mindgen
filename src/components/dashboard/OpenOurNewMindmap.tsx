"use client";
import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";
import { useRecoilState } from "recoil";

import { Button } from "@/components/ui";
import { generateModalState, modalState } from "@/state";
import { uppercaseFirstLetter } from "@/utils";

function OpenOurNewMindmap() {
  const text = useTranslations("Index");

  const size = 15;

  const [isGenerateModalOpen, setIsGenerateModalOpen] = useRecoilState(generateModalState);
  const [isOpen, setIsOpen] = useRecoilState(modalState);

  const handleGenerateMindmap = () => {
    setIsGenerateModalOpen(!isGenerateModalOpen);
  };

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <ul className="inline-block space-x-4">
        <li className="float-left dark:text-white">
          <Button onClick={handleGenerateMindmap} variant={"outline"}>
            <Sparkles className="mr-2" height={size} />
            <p className="dark:text-white">{uppercaseFirstLetter(text("generate"))} mind map</p>
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
