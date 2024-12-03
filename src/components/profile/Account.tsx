import { useTranslations } from "next-intl";
import React from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "react-query";
import { motion } from "framer-motion";
import { User, Mail, Lock, Save } from "lucide-react";

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

  const hasErrors = Object.keys(errors).length > 0;
  const password = watch("password");

  const onSubmit = () => {
    // console.log("data:", JSON.stringify(data));
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

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
          <motion.section variants={itemVariants} whileHover={{ scale: 1.01 }} className="group">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-4 h-4 text-gray-400 group-hover:text-primary-color transition-colors" />
              <p className="text-grey dark:text-grey-blue text-sm">
                {uppercaseFirstLetter(profileText("username"))}
              </p>
            </div>
            <Input
              id="username"
              type="text"
              className={`max-w-sm w-full transition-all duration-200 focus:ring-2 focus:ring-primary-color/50 ${errors.username ? "border-red-500" : "hover:border-primary-color"}`}
              {...register("username", { required: true })}
              placeholder={`${profileText("update")} ${profileText("username").toLowerCase()}`}
            />
            {errors.username && <span className="text-red-500 text-sm mt-1">{text("requiredInput")}</span>}
          </motion.section>

          <motion.section variants={itemVariants} whileHover={{ scale: 1.01 }} className="group">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4 text-gray-400 group-hover:text-primary-color transition-colors" />
              <p className="text-grey dark:text-grey-blue text-sm">{uppercaseFirstLetter(profileText("email"))}</p>
            </div>
            <Input
              id="email"
              type="text"
              className={`max-w-sm w-full transition-all duration-200 focus:ring-2 focus:ring-primary-color/50 ${errors.email ? "border-red-500" : "hover:border-primary-color"}`}
              {...register("email", { required: true })}
              placeholder={`${profileText("update")} ${profileText("email").toLowerCase()}`}
            />
            {errors.email && <span className="text-red-500 text-sm mt-1">{text("requiredInput")}</span>}
          </motion.section>

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
                  className={`transition-all duration-200 focus:ring-2 focus:ring-primary-color/50 ${errors.password ? "border-red-500" : "hover:border-primary-color"}`}
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
                    validate: (value) => value === password || text("passwordNotMatching"),
                  })}
                  className={`transition-all duration-200 focus:ring-2 focus:ring-primary-color/50 ${errors.confirmNewPassword ? "border-red-500" : "hover:border-primary-color"}`}
                />
                {errors.confirmNewPassword && (
                  <span className="text-red-500 text-sm mt-1">{errors.confirmNewPassword.message}</span>
                )}
              </section>
            </div>
          </motion.section>

          <motion.div
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              disabled={hasErrors} 
              type="submit"
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-primary-color to-blue-600 hover:opacity-90 transition-all duration-200"
            >
              <Save className="w-4 h-4" />
              {uppercaseFirstLetter(text("save"))}
            </Button>
          </motion.div>
        </form>
      )}
    </motion.div>
  );
}

export { Account };
