import { useTranslations } from "next-intl";
import React from "react";

function MindGenTemplates() {
  const templateText = useTranslations("Index");

  return (
    <div className="p-6 rounded-2xl bg-[#f3f5f7] dark:bg-slate-500 dark:bg-opacity-20">
      <p className="mb-6 font-bold dark:text-white">Mindgen templates</p>
      <article className="inline-block w-full">
        <div className="float-left mr-4">
          <figure className="gradientPrimary w-56 h-24 border-2 mb-2 dark:border-slate-800 rounded-xl"></figure>
          <article>
            <p className="text-sm font-medium dark:text-white">Mindgen mind map</p>
            <p className="text-xs text-primary-color">{templateText("createdBy")} mindgen</p>
          </article>
        </div>

        <div className="float-left mr-4">
          <figure className="gradientPrimary w-56 h-24 border-2 mb-2 dark:border-slate-800 rounded-xl"></figure>
          <article>
            <p className="text-sm font-medium dark:text-white">Mindgen mind map</p>
            <p className="text-xs text-primary-color">{templateText("createdBy")} mindgen</p>
          </article>
        </div>
      </article>
    </div>
  );
}

export { MindGenTemplates };
