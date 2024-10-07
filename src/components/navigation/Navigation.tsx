"use client";
import { MoveRight } from "lucide-react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import React from "react";

import diamondsIcon from "@/assets/icons/diamonds.svg";
import { Button, Input } from "@/components/ui";

import { Link } from "../../navigation";
import { NavProfile } from "./NavProfile";

function Navigation() {
  const { data: session } = useSession();
  const navigationText = useTranslations("Navigation");

  return (
    <nav className="flex justify-center fixed z-50 top-0 w-full py-3 bg-white bg-opacity-60 backdrop-filter backdrop-blur-md dark:bg-slate-800 dark:bg-opacity-50 dark:shadow-slate-900 dark:border-slate-800">
      <div className="flex justify-between max-w-7xl w-[96%]">
        <section className="flex items-center">
          <Link href={`/dashboard`}>
            <figure className=" mr-8">
              <p className="font-bold text-base dark:text-white">
                MIND<span className="text-primary-color">GEN</span>
              </p>
            </figure>
          </Link>
          {session?.session ? (
            <Input className="w-96" type="text" placeholder={navigationText("searchInput")} />
          ) : (
            <></>
          )}
        </section>

        <div className="block space-x-10">
          <Link href={`/pricing`}>
            <Button>
              <Image className="mr-2" src={diamondsIcon} alt="Collaborate icon" />
              {navigationText("upgradeButton")}
            </Button>
          </Link>

          <Link href={`/auth/login`}>
            {session?.session == undefined && (
              <Button className="gap-2" variant={"outline"}>
                Start now
                <MoveRight size={20} />
              </Button>
            )}
          </Link>

          <NavProfile />
        </div>
      </div>
    </nav>
  );
}

export { Navigation };
