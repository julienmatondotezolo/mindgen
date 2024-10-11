/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { AlignJustify, LayoutGrid } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";
import { useRecoilState } from "recoil";

import { modalState } from "@/state";
import { uppercaseFirstLetter } from "@/utils";

import { MindMapBoards } from "./MindMapBoards";
import { OpenOurNewMindmap } from "./OpenOurNewMindmap";

function RecentMindMap() {
  const recentMindmapText = useTranslations("Dashboard");
  const text = useTranslations("Index");

  const [isOpen, setIsOpen] = useRecoilState(modalState);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  const btnBackground = "p-2 rounded-md bg-gray-100 dark:bg-slate-900";

  return (
    <div className="pb-16">
      <section className="flex flex-wrap items-center justify-between mb-8">
        <div className="flex space-x-2">
          <article className={btnBackground}>
            <p className="text-xs">Recently viewed</p>
          </article>
          <article className="p-2 rounded-md">
            <p className="text-xs">Shared mindmap</p>
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
