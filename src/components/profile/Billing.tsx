import { useTranslations } from "next-intl";
import React from "react";

import { Button } from "..";

function Billing() {
  const profileText = useTranslations("Profile");
  const navigationText = useTranslations("Navigation");

  return (
    <div className="w-full">
      <p className="text-xl mb-6 font-bold">{profileText("billing")}</p>

      <article className="w-full space-y-4">
        <div className="w-full h-[1px] self-center my-4 bg-slate-200 dark:bg-slate-500"></div>

        <p>{profileText("billingText")}</p>
        <Button variant="outline">{navigationText("upgradeButton")}</Button>
      </article>
    </div>
  );
}

export { Billing };
