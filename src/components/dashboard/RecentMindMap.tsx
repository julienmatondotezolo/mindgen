/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState } from "react";

import { MindmapDialog } from "../ui/mindmapDialog";
import { MindMapBoards } from "./MindMapBoards";
import { OpenOurNewMindmap } from "./OpenOurNewMindmap";

function RecentMindMap() {
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className=" pb-12">
      <section className="flex flex-wrap justify-between mb-8">
        <p className="mb-6 font-bold dark:text-white">My recent mind maps</p>
        <OpenOurNewMindmap />
      </section>
      <article className="grid sm:grid-cols-5 grid-cols-1 gap-8 w-full">
        <div onClick={handleClick} className="cursor-pointer">
          <figure className="flex w-full h-24 border-2 border-primary-color mb-2 rounded-xl opacity-70 hover:opacity-100">
            <article className="m-auto text-primary-color text-center">
              <span className="text-4xl">+</span>
              <p className="font-medium text-xs">New mind map</p>
            </article>
          </figure>
          <article>
            <p className="text-sm font-medium dark:text-white">New mind map</p>
          </article>
        </div>

        <MindMapBoards />
      </article>

      <MindmapDialog title="" description="" open={isOpen} update={false} setIsOpen={setIsOpen} />
    </div>
  );
}

export { RecentMindMap };
