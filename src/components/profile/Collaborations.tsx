import { useTranslations } from "next-intl";
import React from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "react-query";

import { fetchProfile } from "@/_services";
import { ProfileProps } from "@/_types";
import { uppercaseFirstLetter } from "@/utils";

import { Button, Input, Spinner } from "..";

const fetchUserProfile = () => fetchProfile();

function Collaborations() {
  const text = useTranslations("Index");
  const profileText = useTranslations("Profile");

  const { isLoading, data: userProfile } = useQuery<ProfileProps>("userProfile", fetchUserProfile);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: userProfile?.username,
      email: userProfile?.email,
      password: "",
      confirmNewPassword: "",
    },
  });

  // Check if there are any errors
  const hasErrors = Object.keys(errors).length > 0;

  const onSubmit = (data: any) => {
    console.log("data:", JSON.stringify(data));
  };

  return (
    <div className="w-full">
      <p className="text-xl mb-6 font-bold">{profileText("collaborations")}</p>
      {isLoading ? (
        <Spinner className="flex flex-col items-center" loadingText={`${text("loading")} `}></Spinner>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <Button disabled={hasErrors} type="submit">
            {uppercaseFirstLetter(text("save"))}
          </Button>
        </form>
      )}
    </div>
  );
}

export { Collaborations };
