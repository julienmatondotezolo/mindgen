import { Bell } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import React from "react";
import { useQuery } from "react-query";

import { fetchProfile } from "@/_services";
import profileIcon from "@/assets/icons/profile.svg";
import { uppercaseFirstLetter } from "@/utils";

import { Button, Popover, PopoverContent, PopoverTrigger, Skeleton } from "../ui";
import { ProfileMenu } from "./ProfileMenu";

const fetchUserProfile = () => fetchProfile();

function NavProfile() {
  const text = useTranslations("Index");
  const { isLoading, data: userProfile } = useQuery("userProfile", fetchUserProfile);
  const listStyle =
    "flex w-8 h-8 text-center bg-gray-50 hover:bg-primary-opaque rounded-xl dark:bg-slate-700 hover:dark:bg-slate-500";
  const size = 14;

  if (isLoading)
    return (
      <section className="flex flex-col items-end space-y-2 float-right">
        <Skeleton className="h-3 w-12 bg-grey-blue" />
        <Skeleton className="h-2 w-28 bg-grey-blue" />
      </section>
    );

  if (userProfile)
    return (
      <div className="flex float-right">
        <section className="flex flex-wrap space-x-4">
          <figure className={`${listStyle} cursor-pointer`}>
            <Popover>
              <PopoverTrigger asChild>
                <Bell className="w-4 dark:text-[#d3d0cd] text-[#2d2f33] m-auto" />
              </PopoverTrigger>
              <PopoverContent className="absolute top-10 left-0 z-20 w-64 rounded-xl transition-all duration-500 transform -translate-x-full bg-white shadow-lg dark:border-slate-800 dark:bg-slate-800 dark:text-white dark:bg-opacity-80 backdrop-filter backdrop-blur-lg">
                <div>
                  <p className="font-bold text-xl mb-4">{uppercaseFirstLetter(text("invitations"))}</p>
                  <article className="space-y-4">
                    <section className=" inline-flex">
                      <figure className="flex h-10 w-10 bg-primary-color mr-4 rounded-full">
                        <p className="m-auto text-xs">G</p>
                      </figure>
                      <article className="text-xs">
                        <p className="font-bold">Goldy</p>
                        <p className="bold">goldy@yopmail.com</p>
                      </article>
                      <Button>Accepter</Button>
                    </section>
                  </article>
                </div>
              </PopoverContent>
            </Popover>
          </figure>
          <figure className={`${listStyle} cursor-pointer`}>
            <Popover>
              <PopoverTrigger asChild>
                <Image
                  className="m-auto dark:invert dark:group-hover"
                  src={profileIcon}
                  width={size}
                  alt="Profile icon"
                />
              </PopoverTrigger>
              <PopoverContent className="absolute top-10 left-0 z-20 w-64 rounded-xl transition-all duration-500 transform -translate-x-full bg-white shadow-lg dark:border-slate-800 dark:bg-slate-800 dark:text-white dark:bg-opacity-80 backdrop-filter backdrop-blur-lg">
                <ProfileMenu />
                {/* Place content for the popover here. */}
              </PopoverContent>
            </Popover>
          </figure>
        </section>

        <div className="w-[1px] h-8 self-center mx-4 bg-slate-200 dark:bg-[#5a5d6d]"></div>

        <article className="text-meft">
          <p className="text-primary-color text-sm font-bold">{uppercaseFirstLetter(userProfile.username)}</p>
          <p className="text-xs dark:text-white">{userProfile.email}</p>
        </article>
      </div>
    );
}

export { NavProfile };
