import { motion } from "framer-motion";
import { Loader2Icon, Lock, Mail, Save, User } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import React from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "react-query";

import { changePassword } from "@/_services";
import { CustomSession, ProfileProps } from "@/_types";
import { uppercaseFirstLetter } from "@/utils";

import { Button, Input, Spinner } from "..";

function Account() {
  const text = useTranslations("Index");
  const profileText = useTranslations("Profile");

  const session = useSession();

  const safeSession = session ? (session as unknown as CustomSession) : null;

  const queryClient = useQueryClient();

  const { isLoading, data: userProfile } = useQuery<ProfileProps>("userProfile");

  const fetchPasswordChange = useMutation(changePassword, {
    mutationKey: "PASSWORD_CHANGE",
    onSuccess: async () => {
      try {
        queryClient.invalidateQueries("userProfile");
      } catch (error) {
        if (error instanceof Error) {
          console.error(`An error has occurred: ${error.message}`);
        }
      }
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: userProfile?.username,
      email: userProfile?.email,
      password: "",
      confirmNewPassword: "",
    },
  });

  const hasErrors = Object.keys(errors).length > 0;

  const onSubmit = (data: any) => {
    const passwordBody = {
      newPassword: data.confirmNewPassword,
      currentPassword: data.password,
    };

    fetchPasswordChange.mutateAsync({ session: safeSession, passwordBody });
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  if (userProfile)
    return (
      <motion.div
        className="w-full max-w-4xl mx-auto p-6 rounded-2xl bg-white/50 dark:bg-slate-800/30 backdrop-blur-sm shadow-lg"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.p
          className="text-2xl mb-8 font-bold bg-gradient-to-r from-primary-color to-blue-600 bg-clip-text text-transparent"
          variants={itemVariants}
        >
          {profileText("account")}
        </motion.p>

        {isLoading ? (
          <Spinner className="flex flex-col items-center" loadingText={`${text("loading")} `} />
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <section>
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-gray-400 transition-colors" />
                <p className="text-grey dark:text-grey-blue text-sm">{uppercaseFirstLetter(profileText("username"))}</p>
              </div>
              <Input
                id="username"
                type="text"
                value={userProfile.username}
                disabled
                className={`max-w-sm w-full transition-all duration-200 focus:ring-2 focus:ring-primary-color/50 ${
                  errors.username ? "border-red-500" : "hover:border-primary-color"
                }`}
                placeholder={`${profileText("update")} ${profileText("username").toLowerCase()}`}
              />
              {errors.username && <span className="text-red-500 text-sm mt-1">{text("requiredInput")}</span>}
            </section>

            <section>
              <div className="flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4 text-gray-400 transition-colors" />
                <p className="text-grey dark:text-grey-blue text-sm">{uppercaseFirstLetter(profileText("email"))}</p>
              </div>
              <Input
                id="email"
                type="text"
                value={userProfile.email}
                disabled
                className={`max-w-sm w-full transition-all duration-200 focus:ring-2 focus:ring-primary-color/50 ${
                  errors.email ? "border-red-500" : "hover:border-primary-color"
                }`}
                placeholder={`${profileText("update")} ${profileText("email").toLowerCase()}`}
              />
              {errors.email && <span className="text-red-500 text-sm mt-1">{text("requiredInput")}</span>}
            </section>

            <motion.section variants={itemVariants} whileHover={{ scale: 1.01 }} className="group">
              <div className="flex items-center gap-2 mb-4">
                <Lock className="w-4 h-4 text-gray-400 group-hover:text-primary-color transition-colors" />
                <p className="font-bold">{profileText("changePassword")}</p>
              </div>
              <div className="flex flex-col md:flex-row gap-6 w-full">
                <section className="flex-1">
                  <p className="text-grey dark:text-grey-blue text-sm mb-2">{profileText("newPassword")}</p>
                  <Input
                    id="password"
                    type="password"
                    {...register("password", { required: true })}
                    placeholder={profileText("newPassword")}
                    className={`transition-all duration-200 focus:ring-2 focus:ring-primary-color/50 ${
                      errors.password ? "border-red-500" : "hover:border-primary-color"
                    }`}
                  />
                  {errors.password && <span className="text-red-500 text-sm mt-1">{text("requiredInput")}</span>}
                </section>
                <section className="flex-1">
                  <p className="text-grey dark:text-grey-blue text-sm mb-2">{profileText("confirmNewPassword")}</p>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder={profileText("confirmNewPassword")}
                    {...register("confirmNewPassword", {
                      required: true,
                    })}
                    className={`transition-all duration-200 focus:ring-2 focus:ring-primary-color/50 ${
                      errors.confirmNewPassword ? "border-red-500" : "hover:border-primary-color"
                    }`}
                  />
                  {errors.confirmNewPassword && (
                    <span className="text-red-500 text-sm mt-1">{errors.confirmNewPassword.message}</span>
                  )}
                </section>
              </div>
            </motion.section>

            <Button
              disabled={hasErrors || fetchPasswordChange.isLoading}
              type="submit"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-primary-color to-blue-600 hover:opacity-90 transition-all duration-200"
            >
              {fetchPasswordChange.isLoading ? (
                <>
                  <Loader2Icon className="w-4 h-4 animate-spin" />
                  {uppercaseFirstLetter(text("loading"))}...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {uppercaseFirstLetter(text("save"))}
                </>
              )}
            </Button>
          </form>
        )}
      </motion.div>
    );
}

export { Account };
