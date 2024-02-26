"use client";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { useQuery } from "react-query";

import { fetchProfile } from "@/_services";
import { ProfileProps } from "@/_types";
import { BackDropGradient, Button, Input, Navigation } from "@/components";
import { uppercaseFirstLetter } from "@/utils";

const fetchUserProfile = () => fetchProfile();

export default function Profile() {
  const text = useTranslations("Index");
  const profileText = useTranslations("Profile");

  const { isLoading, data: userProfile } = useQuery<ProfileProps>("userProfile", fetchUserProfile);

  const [username, setUsername] = useState(userProfile?.username);
  const [email, setEmail] = useState(userProfile?.email);

  // Update state when input changes
  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
  };
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  return (
    <>
      <Navigation />
      <div className="relative flex justify-center pt-32">
        <BackDropGradient />
        <div className="flex flex-wrap justify-between max-w-7xl w-[90%]">
          <ul className="w-[20%] space-y-4">
            <li>
              <button className="w-full flex items-center p-2 px-4 space-x-3 hover:bg-gray-100 dark:bg-slate-800 dark:hover:bg-gray-700 dark:text-white rounded-xl">
                <p>{profileText("account")}</p>
              </button>
            </li>
            <li>
              <button className="w-full flex items-center p-2 px-4 space-x-3 hover:bg-gray-100 dark:bg-slate-800 dark:hover:bg-gray-700 dark:text-white rounded-xl">
                <p>{profileText("yourCollaborations")}</p>
              </button>
            </li>
          </ul>
          <div className="w-[70%] p-6 rounded-2xl bg-[#f3f5f7] dark:bg-slate-500 dark:bg-opacity-20">
            <p className="text-xl mb-6 font-bold">{profileText("account")}</p>
            <form className="space-y-8">
              <section>
                <p className="text-grey dark:text-grey-blue text-sm mb-2">
                  {uppercaseFirstLetter(profileText("username"))}
                </p>
                <Input
                  id="username"
                  type="text"
                  className="max-w-sm w-full"
                  value={username}
                  onChange={handleUsernameChange}
                  placeholder={`${profileText("update")} ${profileText("username").toLowerCase()}`}
                  required
                  // disabled={updateMindmapMutation.isLoading}
                />
              </section>
              <section>
                <p className="text-grey dark:text-grey-blue text-sm mb-2">
                  {uppercaseFirstLetter(profileText("email"))}
                </p>
                <Input
                  id="email"
                  type="text"
                  className="max-w-sm w-full"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder={`${profileText("update")} ${profileText("email").toLowerCase()}`}
                  required
                  // disabled={updateMindmapMutation.isLoading}
                />
              </section>
              <section>
                <p className="mb-2 font-bold">{profileText("changePassword")}</p>
                <div className="flex flew-wrap justify-between w-full">
                  <section className="max-w-[48%] w-full">
                    <p className="text-grey dark:text-grey-blue text-sm mb-2">{profileText("newPassword")}</p>
                    <Input
                      id="password"
                      type="password"
                      // value={username}
                      // onChange={handleUsernameChange}
                      placeholder={profileText("newPassword")}
                      required
                      // disabled={updateMindmapMutation.isLoading}
                    />
                  </section>
                  <section className="max-w-[48%] w-full">
                    <p className="text-grey dark:text-grey-blue text-sm mb-2">{profileText("confirmNewPassword")}</p>
                    <Input
                      id="confirmNewPassword"
                      type="password"
                      // value={username}
                      // onChange={handleUsernameChange}
                      placeholder={profileText("confirmNewPassword")}
                      required
                      // disabled={updateMindmapMutation.isLoading}
                    />
                  </section>
                </div>
              </section>
              <Button type="submit">{uppercaseFirstLetter(text("save"))}</Button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
