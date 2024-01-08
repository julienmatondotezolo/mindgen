import React from "react";
import { useQuery } from "react-query";

import { fetchProfile } from "@/_services";
import { uppercaseFirstLetter } from "@/utils";

import { Skeleton } from "../ui/skeleton";
import { ProfileMenu } from "./ProfileMenu";

const fetchUserProfile = () => fetchProfile();

function NavProfile() {
  const { isLoading, data: userProfile } = useQuery("userProfile", fetchUserProfile);

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
        <article className=" text-right">
          <p className="text-primary-color text-sm font-bold">{uppercaseFirstLetter(userProfile.username)}</p>
          <p className=" text-xs">{userProfile.email}</p>
        </article>

        <div className="w-[1px] h-8 self-center mx-4 bg-slate-200"></div>

        <ProfileMenu />
      </section>
    );
}

export { NavProfile };
