/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { AlignJustify, LayoutGrid, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";
import { useRecoilState, useRecoilValue } from "recoil";

import { boardsLengthState, newBoardState, profilMaxMindmapState } from "@/state";
import { uppercaseFirstLetter } from "@/utils";

import { Button } from "../ui";
import { MindMapBoards } from "./MindMapBoards";

function RecentMindMap() {
  const text = useTranslations("Index");
  const [isOpen, setIsOpen] = useRecoilState(newBoardState);
  const maxMindmap = useRecoilValue(profilMaxMindmapState);
  const boardLength = useRecoilValue(boardsLengthState);
  const leftBoards = maxMindmap - boardLength;

  const canCreateNewBoard = leftBoards > 0;

  const handleNewBoard = () => {
    if (canCreateNewBoard) {
      setIsOpen(!isOpen);
      return;
    }

    alert("Upgrade required! Upgrade to create unlimited boards for you and your clients");
  };

  const size = 15;

  const btnBackground = "p-2 rounded-md bg-gray-100 dark:bg-slate-900";

  return (
    <div className="pb-16">
      <div className="w-full flex justify-between items-center mb-8">
        <section className="grid grid-cols-2 gap-8">
          <div className="flex space-x-2">
            <article className={btnBackground}>
              <p className="text-xs">Recently viewed</p>
            </article>
            <article className="p-2 rounded-md">
              <p className="text-xs">Shared mindmaps</p>
            </article>
          </div>
          <div className="flex space-x-2">
            <section className={btnBackground}>
              <LayoutGrid size={15} />
            </section>
            <section className="p-2 rounded-md">
              <AlignJustify size={15} />
            </section>
          </div>
        </section>

        <Button onClick={handleNewBoard}>
          <Sparkles height={size} />
          {uppercaseFirstLetter(text("new"))} board
        </Button>
      </div>
      <article className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-3 gap-8 w-full">
        {/* <div onClick={handleClick} className="cursor-pointer">
          <figure className="flex w-full h-24 border-2 border-primary-color mb-2 rounded-xl opacity-70 hover:opacity-100">
            <article className="m-auto text-primary-color text-center">
              <span className="text-4xl">+</span>
              <p className="font-medium text-xs">{uppercaseFirstLetter(text("new"))} mind map</p>
            </article>
          </figure>
          <article>
            <p className="text-sm font-medium dark:text-white">{uppercaseFirstLetter(text("new"))} mind map</p>
          </article>
        </div> */}

        <MindMapBoards />
      </article>
    </div>
  );
}

export { RecentMindMap };
