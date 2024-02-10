import Image from "next/image";
import React from "react";
import { useQuery } from "react-query";

import { fetchProfile } from "@/_services";
import profileIcon from "@/assets/icons/profile.svg";
import { uppercaseFirstLetter } from "@/utils";

import { Popover, PopoverContent, PopoverTrigger, Skeleton } from "../ui";
import { ProfileMenu } from "./ProfileMenu";

const fetchUserProfile = () => fetchProfile();

function NavProfile() {
  const { isLoading, data: userProfile } = useQuery("userProfile", fetchUserProfile);
  const listStyle = "p-2 bg-gray-50 hover:bg-primary-opaque rounded-xl";
  const size = 17;

  if (isLoading)
    return (
      <section className="flex flex-col items-end space-y-2 float-right">
        <Skeleton className="h-3 w-12 bg-grey-blue" />
        <Skeleton className="h-2 w-28 bg-grey-blue" />
      </section>
    );

  if (userProfile)
    return (
      <section className="flex float-right">
        <article className="text-right">
          <p className="text-primary-color text-sm font-bold">{uppercaseFirstLetter(userProfile.username)}</p>
          <p className=" text-xs">{userProfile.email}</p>
        </article>

        <div className="w-[1px] h-8 self-center mx-4 bg-slate-200"></div>

        <figure className={`${listStyle} cursor-pointer`}>
          <Popover>
            <PopoverTrigger asChild>
              <Image src={profileIcon} width={size} alt="Profile icon" />
            </PopoverTrigger>
            <PopoverContent className="absolute top-10 left-0 z-20 w-64 rounded-xl transition-all duration-500 transform -translate-x-full bg-white shadow-lg">
              <ProfileMenu />
              {/* Place content for the popover here. */}
            </PopoverContent>
          </Popover>
        </figure>
      </section>
    );
}

export { NavProfile };
