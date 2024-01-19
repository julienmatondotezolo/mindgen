/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
"use-client";

import Image from "next/image";
import { signOut } from "next-auth/react";
import React from "react";

import profileIcon from "@/assets/icons/profile.svg";

function ProfileMenu() {
  const listStyle = "p-2 bg-gray-50 hover:bg-primary-opaque rounded-xl";
  const size = 17;

  function handleLogout() {
    signOut({
      callbackUrl: process.env.NEXT_PUBLIC_URL + "/auth/login",
    });
  }

  return (
    <figure onClick={handleLogout} className={`${listStyle} cursor-pointer`}>
      <Image src={profileIcon} width={size} alt="Profile icon" />
    </figure>
  );
}

export { ProfileMenu };
