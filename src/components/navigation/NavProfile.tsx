import { Bell, Mail } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "react-query";

import { acceptInvitation, fetchInvitations, fetchProfile } from "@/_services";
import profileIcon from "@/assets/icons/profile.svg";
import { formatDate, uppercaseFirstLetter } from "@/utils";

import { Button, Popover, PopoverContent, PopoverTrigger, Skeleton } from "../ui";
import { ProfileMenu } from "./ProfileMenu";

const fetchUserProfile = () => fetchProfile();
const fetchUserInvitations = () => fetchInvitations();

function NavProfile() {
  const text = useTranslations("Index");
  const dateText = useTranslations("Dashboard");
  const [isAccepting, setIsAccepting] = useState(false);

  const queryClient = useQueryClient();
  const { isLoading, data: userProfile } = useQuery("userProfile", fetchUserProfile);
  const { data: userInvitations } = useQuery("userInvitations", fetchUserInvitations, {
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const invitationLength = userInvitations && userInvitations.length;

  const { mutateAsync } = useMutation(acceptInvitation);
  const handleAccept = async (invitationId: string) => {
    try {
      setIsAccepting(true);
      await mutateAsync(invitationId, {
        onSuccess: async () => {
          // Invalidate the query to cause a re-fetch
          await queryClient.invalidateQueries("userInvitations");
          setIsAccepting(false);
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error(`An error has occurred: ${error.message}`);
      }
    }
  };

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
          <figure className={`relative ${listStyle} cursor-pointer`}>
            {invitationLength > 0 && (
              <div className="absolute flex -top-1 -right-2 w-5 h-5 rounded-full bg-red-600 text-xs">
                <p className="m-auto text-white">{invitationLength < 9 ? invitationLength : "+9"}</p>
              </div>
            )}
            <Popover>
              <PopoverTrigger asChild>
                <Bell className="w-4 dark:text-[#d3d0cd] text-[#2d2f33] m-auto" />
              </PopoverTrigger>
              <PopoverContent className="absolute top-10 left-0 z-20 w-auto rounded-xl transition-all duration-500 transform -translate-x-full bg-white shadow-lg dark:border-slate-800 dark:bg-slate-800 dark:text-white dark:bg-opacity-80 backdrop-filter backdrop-blur-lg">
                <div className="w-96">
                  <p className="font-bold text-xl mb-4">{uppercaseFirstLetter(text("invitations"))}</p>
                  <article className="space-y-4">
                    {invitationLength > 0 ? (
                      userInvitations?.map((invitation: any) => (
                        <section
                          className="flex justify-between space-x-4 w-full py-4 border-b dark:border-slate-700"
                          key={invitation.id}
                        >
                          <figure className="flex h-10 w-10 bg-primary-color rounded-full">
                            <p className="m-auto text-xs">{invitation.inviterUsername.substring(0, 1).toUpperCase()}</p>
                          </figure>
                          <article className="flex flex-col justify-center text-xs w-52">
                            <p className="font-bold text-base">Invited to {invitation.mindmapName}</p>
                            <p className="bold">{invitation.inviterUsername} wants you to join his mindmap</p>
                            <p className="text-xs opacity-50 mt-1">{formatDate(invitation.createdAt, dateText)}</p>
                          </article>
                          <Button className="h-fit" onClick={() => handleAccept(invitation.id)} disabled={isAccepting}>
                            {isAccepting ? "Accepting..." : "Accept "}
                          </Button>
                        </section>
                      ))
                    ) : (
                      <div className="inline-flex items-center">
                        <Mail className="mr-2 opacity-50" />
                        <p className="text-sm opacity-50">No invitations</p>
                      </div>
                    )}
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
