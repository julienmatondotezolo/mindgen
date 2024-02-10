"use-client";

import { signOut } from "next-auth/react";
import React from "react";

function ProfileMenu() {
  function handleLogout() {
    try {
      signOut({
        callbackUrl: process.env.NEXT_PUBLIC_URL + "/auth/login",
      });
    } catch (error) {
      console.error("Error during sign out:", error);
    }
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold dark:text-white">Profile Menu</h2>
      </div>
      <div className="mt-4">
        <ul className="space-y-2">
          <li>Dark Mode</li>
          <li>Language</li>
          <li>Help</li>
          <li onClick={handleLogout} className="dark:bg-gray-700 dark:text-white p-2 rounded-md">
            Logout
          </li>
        </ul>
      </div>
    </div>
  );
}

export { ProfileMenu };
