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
    <div>
      <section className="flex flex-wrap justify-between mb-6">
        <p className="mb-6 font-bold">My recent mind maps</p>
        <OpenOurNewMindmap />
      </section>
      <article className="flex flex-wrap w-full">
        <div onClick={handleClick} className="mr-4 cursor-pointer">
          <figure className="flex w-44 h-24 border-2 border-primary-color mb-2 rounded-xl">
            <article className="m-auto text-primary-color text-center">
              <span className="text-4xl">+</span>
              <p className="font-medium text-xs">New mind map</p>
            </article>
          </figure>
          <article>
            <p className="text-sm font-medium">New mind map</p>
          </article>
        </div>

        <MindMapBoards />
      </article>

      <MindmapDialog title="" description="" open={isOpen} setIsOpen={setIsOpen} />
    </div>
  );
}

export { RecentMindMap };
