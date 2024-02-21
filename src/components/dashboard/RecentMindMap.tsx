/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useTranslations } from "next-intl";
import React from "react";
import { useRecoilState } from "recoil";

import { modalState } from "@/recoil";
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

  return (
    <div className="pt-8 pb-16">
      <section className="flex flex-wrap justify-between mb-8">
        <p className="mb-6 font-bold dark:text-white">{recentMindmapText("myRecentMindmaps")}</p>
        <OpenOurNewMindmap />
      </section>
      <article className="grid sm:grid-cols-5 grid-cols-1 gap-8 w-full">
        <div onClick={handleClick} className="cursor-pointer">
          <figure className="flex w-full h-24 border-2 border-primary-color mb-2 rounded-xl opacity-70 hover:opacity-100">
            <article className="m-auto text-primary-color text-center">
              <span className="text-4xl">+</span>
              <p className="font-medium text-xs">{uppercaseFirstLetter(text("new"))} mind map</p>
            </article>
          </figure>
          <article>
            <p className="text-sm font-medium dark:text-white">{uppercaseFirstLetter(text("new"))} mind map</p>
          </article>
        </div>

        <MindMapBoards />
      </article>
    </div>
  );
}

export { RecentMindMap };
