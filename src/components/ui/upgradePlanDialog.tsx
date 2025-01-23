/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/label-has-associated-control */
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import React, { FC, useEffect, useRef } from "react";

import { DialogProps } from "@/_types";
import { Link } from "@/navigation";
import { uppercaseFirstLetter } from "@/utils";

import { Button } from ".";

const UpgradePlanDialog: FC<DialogProps> = ({ open, setIsOpen }) => {
  const navigationText = useTranslations("Navigation");
  const modalRef = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    // setIsOpen(false);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!modalRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={modalRef}
      className={`${
        open ? "block" : "hidden"
      } fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 sm:w-11/12 md:w-4/12 bg-white border-2 p-6 space-y-8 rounded-xl shadow-lg backdrop-filter backdrop-blur-lg dark:bg-slate-900 dark:bg-opacity-70 dark:shadow-slate-900 dark:border-slate-800`}
    >
      <article className="flex flex-wrap justify-between w-full">
        <p className="font-bold text-xl">{uppercaseFirstLetter(navigationText("upgradeButton"))}</p>
        <X className="cursor-pointer" onClick={handleClose} />
      </article>
      <div className="w-full mt-4">
        <p>Oops.... Looks like with you&#39;re current plan. This option is unavailable!</p>
        <p className="p-16-regular py-3">
          No worries, though - you can keep enjoying our services by grabbing another plan.
        </p>
        <Link href={`/pricing`}>
          <Button variant="outline">{navigationText("upgradeButton")}</Button>
        </Link>
      </div>
    </div>
  );
};

export { UpgradePlanDialog };
