import React from "react";

import { MindMapBoards } from "./MindMapBoards";
import { OpenOurNewMindmap } from "./OpenOurNewMindmap";

function RecentMindMap() {
  return (
    <div>
      <section className="flex flex-wrap justify-between mb-6">
        <p className="mb-6 font-bold">My recent mind maps</p>
        <OpenOurNewMindmap />
      </section>
      <article className="flex flex-wrap w-full">
        <div className="mr-4">
          <figure className="flex w-56 h-24 border-2 border-primary-color mb-2 rounded-xl">
            <article className="m-auto text-primary-color text-center">
              <span className="text-4xl">+</span>
              <p className="font-medium">New mind map</p>
            </article>
          </figure>
          <article>
            <p className="text-sm font-medium">New mind map</p>
          </article>
        </div>

        <MindMapBoards />
      </article>
    </div>
  );
}

export { RecentMindMap };
