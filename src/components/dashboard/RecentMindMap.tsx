import React from "react";

import { OpenOurNewMindmap } from "./OpenOurNewMindmap";

function RecentMindMap() {
  return (
    <div>
      <section className="flex flex-wrap justify-between items-center mb-4">
        <p className="mb-6 font-bold">My recent mind maps</p>
        <OpenOurNewMindmap />
      </section>
      <article className="inline-block w-full">
        <div className="float-left mr-4">
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

        <div className="float-left mr-4">
          <figure className="gradientPrimary w-56 h-24 border-2 mb-2 rounded-xl"></figure>
          <article>
            <p className="text-sm font-medium">Test mind map</p>
            <p className="text-xs text-primary-color">Created by mindgen</p>
            <p className="text-xs text-primary-color">Dec 1, 2023</p>
          </article>
        </div>

        <div className="float-left mr-4">
          <figure className="gradientPrimary w-56 h-24 border-2 mb-2 rounded-xl"></figure>
          <article>
            <p className="text-sm font-medium">Mindgen mind map</p>
            <p className="text-xs text-primary-color">Created by mindgen</p>
            <p className="text-xs text-primary-color">Jan 13</p>
          </article>
        </div>
      </article>
    </div>
  );
}

export { RecentMindMap };
