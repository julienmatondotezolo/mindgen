import React from "react";

function MindGenTemplates() {
  return (
    <div className="p-6 rounded-2xl bg-[#f3f5f7]">
      <p className="mb-6 font-bold">Mindgen templates</p>
      <article className="inline-block w-full">
        <div className="float-left mr-4">
          <figure className="gradientPrimary w-56 h-24 border-2 mb-2 rounded-xl"></figure>
          <article>
            <p className="text-sm font-medium">Mindgen mind map</p>
            <p className="text-xs text-primary-color">Created by mindgen</p>
          </article>
        </div>

        <div className="float-left mr-4">
          <figure className="gradientPrimary w-56 h-24 border-2 mb-2 rounded-xl"></figure>
          <article>
            <p className="text-sm font-medium">Mindgen mind map</p>
            <p className="text-xs text-primary-color">Created by mindgen</p>
          </article>
        </div>
      </article>
    </div>
  );
}

export { MindGenTemplates };
