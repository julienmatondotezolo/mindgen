"use-client";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import React from "react";

import arrowforwardIcon from "@/assets/icons/arrowforward.svg";
import darkmodeIcon from "@/assets/icons/darkmode.svg";
import helpIcon from "@/assets/icons/help.svg";
import languageIcon from "@/assets/icons/language.svg";
import lightmodeIcon from "@/assets/icons/lightmode.svg";
import logoutIcon from "@/assets/icons/logout.svg";
import profileIcon from "@/assets/icons/profile.svg";
import { Link } from "@/navigation";

import LanguageSwitcher from "../ui/languageSwitcher";

function ProfileMenu() {
  const text = useTranslations("Index");
  const profileText = useTranslations("Profile");

  const { setTheme, resolvedTheme } = useTheme();
  const size = 17;

  const toggleDarkMode = () => {
    if (resolvedTheme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  function handleLogout() {
    try {
      localStorage.removeItem("selected-organization");
      signOut({
        callbackUrl: process.env.NEXT_PUBLIC_URL + "/",
      });
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  }

  return (
    <div>
      <Link href={`/profile`}>
        <button className="w-full group flex justify-between items-center cursor-pointe rounded-xl dark:bg-slate-800 dark:hover:bg-gray-700 dark:text-white">
          <section className="flex items-center space-x-3">
            <figure className="bg-gray-100 rounded-full w-10 h-10 flex m-auto dark:bg-transparent">
              <Image src={profileIcon} width={size / 1.2} className="m-auto dark:invert" alt="Profile icon" />
            </figure>
            <h2 className="text-base font-semibold dark:text-white">{profileText("viewProfile")}</h2>
          </section>
          <Image
            src={arrowforwardIcon}
            className="mr-6 opacity-50 group-hover:mr-4 group-hover:opacity-100 dark:invert transition-all duration-200 ease-in-out"
            width={size / 2}
            alt="Profile icon"
          />
        </button>
      </Link>
      <div className="w-full h-[1px] self-center my-4 bg-slate-200 dark:bg-slate-500"></div>
      <div className="mt-4">
        <ul className="space-y-2">
          <li className="cursor-pointer">
            <button
              onClick={toggleDarkMode}
              className="w-full flex items-center p-2 space-x-3 hover:bg-gray-100 dark:bg-slate-800 dark:hover:bg-gray-700 dark:text-white rounded-xl"
            >
              <Image
                className="dark:invert"
                src={resolvedTheme === "dark" ? lightmodeIcon : darkmodeIcon}
                width={size}
                alt="Profile icon"
              />
              <p>{resolvedTheme === "dark" ? "Light mode" : "Dark mode"}</p>
            </button>
          </li>
          <li>
            <button className="w-full flex items-center p-2 space-x-3 hover:bg-gray-100 dark:bg-slate-800 dark:hover:bg-gray-700 dark:text-white rounded-t-xl rounded-br-xl">
              <Image className="dark:invert" src={languageIcon} width={size} alt="Profile icon" />
              <p>{text("language")}</p>
            </button>
            <LanguageSwitcher />
          </li>
          <li>
            <button className="w-full flex items-center p-2 space-x-3 hover:bg-gray-100 dark:bg-slate-800 dark:hover:bg-gray-700 dark:text-white rounded-xl">
              <Image className="dark:invert" src={helpIcon} width={size} alt="Profile icon" />
              <p>{text("help")}</p>
            </button>
          </li>
          <div className="w-full h-[1px] self-center my-4 bg-slate-200 dark:bg-slate-500"></div>
          <li>
            <button
              onClick={handleLogout}
              className="w-full flex items-center p-2 space-x-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Image src={logoutIcon} width={size} alt="Profile icon" />
              <p className=" text-red-500">{text("logout")}</p>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}

export { ProfileMenu };
