import { useTranslations } from "next-intl";
import React from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "react-query";

import { fetchProfile } from "@/_services";
import { ProfileProps } from "@/_types";
import { uppercaseFirstLetter } from "@/utils";

import { Button, Input, Spinner } from "..";

const fetchUserProfile = () => fetchProfile();

function Account() {
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

  const password = watch("password");

  const onSubmit = () => {
    // console.log("data:", JSON.stringify(data));
  };

  return (
    <div className="w-full">
      <p className="text-xl mb-6 font-bold">{profileText("account")}</p>
      {isLoading ? (
        <Spinner className="flex flex-col items-center" loadingText={`${text("loading")} `}></Spinner>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <section>
            <p className="text-grey dark:text-grey-blue text-sm mb-2">
              {uppercaseFirstLetter(profileText("username"))}
            </p>
            <Input
              id="username"
              type="text"
              className={`max-w-sm w-full ${errors.username && "border-red-500"}`}
              {...register("username", { required: true })}
              placeholder={`${profileText("update")} ${profileText("username").toLowerCase()}`}
              // disabled={updateMindmapMutation.isLoading}
            />
            {errors.username && <span className="text-red-500 text-sm">{text("requiredInput")}</span>}
          </section>
          <section>
            <p className="text-grey dark:text-grey-blue text-sm mb-2">{uppercaseFirstLetter(profileText("email"))}</p>
            <Input
              id="email"
              type="text"
              className={`max-w-sm w-full ${errors.email && "border-red-500"}`}
              {...register("email", { required: true })}
              placeholder={`${profileText("update")} ${profileText("email").toLowerCase()}`}
              // disabled={updateMindmapMutation.isLoading}
            />
            {errors.email && <span className="text-red-500 text-sm">{text("requiredInput")}</span>}
          </section>
          <section>
            <p className="mb-2 font-bold">{profileText("changePassword")}</p>
            <div className="flex flew-wrap justify-between w-full">
              <section className="max-w-[48%] w-full">
                <p className="text-grey dark:text-grey-blue text-sm mb-2">{profileText("newPassword")}</p>
                <Input
                  id="password"
                  type="password"
                  {...register("password", { required: true })}
                  placeholder={profileText("newPassword")}
                  className={errors.password && "border-red-500"}
                  // disabled={updateMindmapMutation.isLoading}
                />
                {errors.password && <span className="text-red-500 text-sm">{text("requiredInput")}</span>}
              </section>
              <section className="max-w-[48%] w-full">
                <p className="text-grey dark:text-grey-blue text-sm mb-2">{profileText("confirmNewPassword")}</p>
                <Input
                  id="new-password"
                  type="password"
                  placeholder={profileText("confirmNewPassword")}
                  {...register("confirmNewPassword", {
                    required: true,
                    validate: (value) => value === password || text("passwordNotMatching"),
                  })}
                  className={errors.confirmNewPassword && "border-red-500"}
                  // disabled={updateMindmapMutation.isLoading}
                />
                {errors.confirmNewPassword && (
                  <span className="text-red-500 text-sm">{errors.confirmNewPassword.message}</span>
                )}
              </section>
            </div>
          </section>
          <Button disabled={hasErrors} type="submit">
            {uppercaseFirstLetter(text("save"))}
          </Button>
        </form>
      )}
    </div>
  );
}

export { Account };
