import { useTranslations } from "next-intl";
import React from "react";

import { uppercaseFirstLetter } from "@/utils";

function OrgMembers() {
  const text = useTranslations("Index");

  return (
    <div className="w-full">
      <p className="font-bold text-lg pb-4 border-b dark:border-slate-800">{uppercaseFirstLetter(text("members"))}</p>
    </div>
  );
}

export { OrgMembers };
