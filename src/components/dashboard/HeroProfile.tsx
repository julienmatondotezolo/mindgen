import React from "react";
import { useQuery } from "react-query";

import { fetchProfile } from "@/_services";
import { uppercaseFirstLetter } from "@/utils";

import { Skeleton } from "../ui/skeleton";

const fetchUserProfile = () => fetchProfile();

function HeroProfile() {
  const { isLoading, data: userProfile } = useQuery("userProfile", fetchUserProfile);

  if (isLoading)
    return (
      <article className="w-full border-b-2 pb-4">
        <Skeleton className="h-6 w-96 bg-grey-blue" />
      </article>
    );

  if (userProfile)
    return (
      <article className="w-full border-b-2 dark:border-slate-800 pb-4">
        <p className="text-2xl font-bold dark:text-white">
          Welcome to Mindgen,{" "}
          <span className="text-primary-color first-letter:uppercase">
            {uppercaseFirstLetter(userProfile.username)}
          </span>
        </p>
      </article>
    );
}

export { HeroProfile };
