"use client";
import { MoveRight } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import React from "react";

import { Button } from "@/components/ui";

import { Link } from "../../navigation";
import { NavProfile } from "./NavProfile";

function Navigation() {
  const { data: session } = useSession();
  const navigationText = useTranslations("Navigation");

  return (
    <nav className="flex justify-center fixed z-50 top-0 w-full py-3 bg-white border-b dark:border-none bg-opacity-60 backdrop-filter backdrop-blur-md dark:bg-slate-800 dark:bg-opacity-50 dark:shadow-slate-900 dark:border-slate-800">
      <div className="flex justify-between max-w-7xl w-[96%]">
        <section className="flex items-center relative">
          <Link href={`/dashboard`}>
            <figure className="relative mr-8">
              <div className="absolute -top-2 -right-5 bg-red-500 text-white text-[8px] px-2 py-0.5 rounded">
                <p className="font-bold tracking-wider">BETA</p>
              </div>
              <p className="font-bold text-base dark:text-white">
                MIND<span className="text-primary-color">GEN</span>
              </p>
            </figure>
          </Link>
        </section>

        <div className="block space-x-10">
          {/* Go to dashboard */}
          {/* <Link href={`/dashboard`}>
            {session?.session == undefined && (
              <Button className="gap-2" variant={"outline"}>
                {navigationText("tryNow")}
                <MoveRight size={20} />
              </Button>
            )}
          </Link> */}
          <Link href={`/waitlist`}>
            {session?.session == undefined && (
              <Button className="gap-2">
                {navigationText("joinWaitList")}
                <MoveRight size={20} />
              </Button>
            )}
          </Link>

          {session?.session && <NavProfile />}
        </div>
      </div>
    </nav>
  );
}

export { Navigation };
