import { ApiError } from "next/dist/server/api-utils";
import Image from "next/image";
import { useSession } from "next-auth/react";
import React from "react";
import { useQuery } from "react-query";
import { useSetRecoilState } from "recoil";
import { motion, AnimatePresence } from "framer-motion";

import { fetchProfile } from "@/_services";
import { CustomSession, ProfileProps } from "@/_types";
import profileIcon from "@/assets/icons/profile.svg";
import { useRouter } from "@/navigation";
import { profilMaxMindmapState } from "@/state";
import { uppercaseFirstLetter } from "@/utils";

import { Popover, PopoverContent, PopoverTrigger, Skeleton } from "../ui";
import { ProfileMenu } from "./ProfileMenu";

function NavProfile() {
  const session = useSession();
  const router = useRouter();
  const setMaxMindmap = useSetRecoilState(profilMaxMindmapState);
  const safeSession = session ? (session as unknown as CustomSession) : null;

  const fetchUserProfile = () => fetchProfile({ session: safeSession });
  const { isLoading, data: userProfile } = useQuery("userProfile", fetchUserProfile, {
    retry: false,
    onSuccess: (data: ProfileProps) => {
      if (data) setMaxMindmap(data.subscriptionDetails.maxMindmaps);
    },
    onError: (data: ApiError) => {
      if (data.statusCode == 500) router.push("/auth/login");
    },
  });

  const listStyle = "flex w-10 h-10 text-center bg-gray-50 hover:bg-primary-opaque rounded-xl dark:bg-slate-700 hover:dark:bg-slate-500 transition-all duration-300";

  if (isLoading)
    return (
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-end space-y-2 float-right"
      >
        <Skeleton className="h-3 w-12 bg-grey-blue" />
        <Skeleton className="h-2 w-28 bg-grey-blue" />
      </motion.section>
    );

  if (userProfile)
    return (
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex float-right items-center"
      >
        <section className="flex flex-wrap space-x-4">
          <Popover>
            <PopoverTrigger asChild>
              <motion.figure 
                className={`${listStyle} cursor-pointer relative overflow-hidden`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <motion.div
                  className="absolute inset-0 bg-primary-color/10 dark:bg-slate-600/30"
                  initial={{ scale: 0, opacity: 0 }}
                  whileHover={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />
                <Image
                  className="m-auto dark:invert dark:group-hover z-10 transition-transform duration-300"
                  src={profileIcon}
                  width={18}
                  height={18}
                  alt="Profile icon"
                />
              </motion.figure>
            </PopoverTrigger>
            <AnimatePresence>
              <PopoverContent className="absolute top-12 left-0 z-20 w-72 rounded-xl bg-white/95 shadow-lg dark:border-slate-800 dark:bg-slate-800/95 dark:text-white backdrop-filter backdrop-blur-lg">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <ProfileMenu />
                </motion.div>
              </PopoverContent>
            </AnimatePresence>
          </Popover>
        </section>

        <motion.div 
          className="w-[1px] h-8 self-center mx-6 bg-slate-200 dark:bg-[#5a5d6d]"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        />

        <motion.article 
          className="text-left"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
        >
          <motion.p 
            className="text-primary-color text-sm font-bold tracking-wide"
            whileHover={{ x: 3 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            {uppercaseFirstLetter(userProfile.username)}
          </motion.p>
          <motion.p 
            className="text-xs text-slate-600 dark:text-slate-300 mt-0.5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.8 }}
            transition={{ delay: 0.2 }}
          >
            {userProfile.email}
          </motion.p>
        </motion.article>
      </motion.div>
    );
}

export { NavProfile };
