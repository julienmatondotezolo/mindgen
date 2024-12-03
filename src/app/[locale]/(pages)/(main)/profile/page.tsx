"use client";
import { useTranslations } from "next-intl";
import React from "react";

import {
  Account,
  BackDropGradient,
  Billing,
  CurrentPlan,
  Navigation,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components";

export default function Profile() {
  const profileText = useTranslations("Profile");
  // const triggerStyle = `w-full flex items-center p-2 px-4 space-x-3 hover:bg-gray-100 dark:bg-slate-800 dark:hover:bg-gray-700 dark:text-white rounded-xl`;

  const triggerStyle = `w-full p-2 px-4 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700`;

  return (
    <>
      <Navigation />
      <div className="relative flex justify-center pt-32">
        <BackDropGradient />
        <Tabs defaultValue="account" className="flex flex-wrap justify-between max-w-7xl w-[90%]">
          <TabsList className="flex flex-col w-[20%] h-max space-y-4">
            <TabsTrigger className={triggerStyle} value="account">
              <p>{profileText("account")}</p>
            </TabsTrigger>
            {/*             <TabsTrigger className={triggerStyle} value="collaborations">
              <p>{profileText("yourCollaborations")}</p>
            </TabsTrigger> */}
            <TabsTrigger className={triggerStyle} value="billing">
              <p>{profileText("billing")}</p>
            </TabsTrigger>
            <CurrentPlan />
          </TabsList>
          <div className="w-[70%] p-6 rounded-2xl bg-[#f3f5f7] dark:bg-slate-500 dark:bg-opacity-20">
            <TabsContent value="account">
              <Account />
            </TabsContent>
            {/*             <TabsContent value="collaborations">
              <Collaborations />
            </TabsContent> */}
            <TabsContent value="billing">
              <Billing />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </>
  );
}
