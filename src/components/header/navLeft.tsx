import Image from "next/image";
import React from "react";

import hamburgerIcon from "@/assets/icons/hamburger.svg";
import { Input } from "@/components/";

function NavRight() {
  const size = 15;

  const listStyle = "p-2 bg-gray-50 rounded-xl hover:bg-gray-200";

  return (
    <div className="w-auto px-1 bg-white rounded-xl shadow-lg">
      <ul className="flex flex-row items-center justify-between">
        <li className="m-1">
          <div className={`${listStyle} cursor-pointer`}>
            <Image src={hamburgerIcon} height={size} width={size} alt="Hamburger icon" />
          </div>
        </li>
        <li className="m-1">
          <Input type="text" placeholder="Untitled project" />
        </li>
      </ul>
    </div>
  );
}

export default NavRight;
