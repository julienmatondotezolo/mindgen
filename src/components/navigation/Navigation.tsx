"use client";
import Image from "next/image";
import React from "react";

import diamondsIcon from "@/assets/icons/diamonds.svg";
import { Button, Input } from "@/components/ui";

import { NavProfile } from "./NavProfile";

function Navigation() {
  return (
    <nav className="flex justify-center fixed z-50 top-0 w-full shadow-lg shadow-gray-200 py-3 bg-white">
      <div className="flex justify-between max-w-7xl w-[96%]">
        <section className="flex items-center">
          <a href={`/dashboard`}>
            <figure className=" mr-8">
              <p className="font-bold text-base">
                MIND<span className="text-primary-color">GEN</span>
              </p>
            </figure>
          </a>
          <Input className="w-96" type="text" placeholder="Search mindmap" />
        </section>

        <div className="block space-x-10">
          <Button>
            <Image className="mr-2" src={diamondsIcon} alt="Collaborate icon" />
            Upgrade
          </Button>

          <NavProfile />
        </div>
      </div>
    </nav>
  );
}

export { Navigation };
