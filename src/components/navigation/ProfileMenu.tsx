"use-client";
import Image from "next/image";
import { signOut } from "next-auth/react";
import React from "react";

import arrowforwardIcon from "@/assets/icons/arrowforward.svg";
import darkmodeIcon from "@/assets/icons/darkmode.svg";
import helpIcon from "@/assets/icons/help.svg";
import languageIcon from "@/assets/icons/language.svg";
import logoutIcon from "@/assets/icons/logout.svg";
import profileIcon from "@/assets/icons/profile.svg";

function ProfileMenu() {
  const size = 17;

  function handleLogout() {
    try {
      signOut({
        callbackUrl: process.env.NEXT_PUBLIC_URL + "/auth/login",
      });
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center cursor-pointer hover:bg-gray-100 rounded-xl dark:bg-gray-700 dark:text-white">
        <section className="flex items-center space-x-3">
          <figure className="bg-gray-100 rounded-full w-10 h-10 flex m-auto dark:bg-gray-700">
            <Image src={profileIcon} width={size / 1.2} className="m-auto" alt="Profile icon" />
          </figure>
          <h2 className="text-base font-semibold dark:text-white">View profile</h2>
        </section>
        <Image src={arrowforwardIcon} className="mr-4" width={size / 2} alt="Profile icon" />
      </div>
      <div className="w-full h-[1px] self-center my-4 bg-slate-200"></div>
      <div className="mt-4">
        <ul className="space-y-2">
          <li>
            <button className="w-full flex items-center p-2 space-x-3 hover:bg-gray-100 dark:bg-gray-700 dark:text-white rounded-xl">
              <Image src={darkmodeIcon} width={size} alt="Profile icon" />
              <p>Dark mode</p>
            </button>
          </li>
          <li>
            <button className="w-full flex items-center p-2 space-x-3 hover:bg-gray-100 dark:bg-gray-700 dark:text-white rounded-xl">
              <Image src={languageIcon} width={size} alt="Profile icon" />
              <p>Language</p>
            </button>
          </li>
          <li>
            <button className="w-full flex items-center p-2 space-x-3 hover:bg-gray-100 dark:bg-gray-700 dark:text-white rounded-xl">
              <Image src={helpIcon} width={size} alt="Profile icon" />
              <p>Help</p>
            </button>
          </li>
          <div className="w-full h-[1px] self-center my-4 bg-slate-200"></div>
          <li>
            <button onClick={handleLogout} className="w-full flex items-center p-2 space-x-3 rounded-xl">
              <Image src={logoutIcon} width={size} alt="Profile icon" />
              <p className=" text-red-500">Logout</p>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}

export { ProfileMenu };
