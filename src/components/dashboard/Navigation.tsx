"use client";
import Image from "next/image";
import React from "react";

import diamondsIcon from "@/assets/icons/diamonds.svg";
import profileIcon from "@/assets/icons/profile.svg";
import { Button, Input } from "@/components/ui";

function Navigation() {
  const size = 17;
  const listStyle = "p-2 bg-gray-50 hover:bg-primary-opaque rounded-xl";

  return (
    <nav className="flex justify-center fixed top w-full shadow-lg py-3 bg-white">
      <div className="flex justify-between max-w-7xl w-[96%]">
        <section className="flex items-center">
          <figure className=" mr-8">
            <p className="font-bold text-lg">
              MIND<span className="text-primary-color">GEN</span>
            </p>
          </figure>
          <Input className="w-96" type="text" placeholder="Search mindmap" />
        </section>

        <div className="block space-x-10">
          <Button>
            <Image className="mr-2" src={diamondsIcon} height={size} width={size} alt="Collaborate icon" />
            Upgrade
          </Button>

          <section className="flex float-right">
            <article className=" text-right">
              <p className="text-primary-color text-sm font-bold">Emji</p>
              <p className=" text-xs">emji@mindgen.ai</p>
            </article>

            <div className="w-[1px] h-8 self-center mx-4 bg-slate-200"></div>

            <figure className={`${listStyle} cursor-pointer`}>
              <Image src={profileIcon} height={size} width={size} alt="Mouse icon" />
            </figure>
          </section>
        </div>
      </div>
    </nav>
  );
}

export { Navigation };
