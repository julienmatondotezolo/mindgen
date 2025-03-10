import { motion } from "framer-motion";
import { ArrowRight, CreditCard } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import React from "react";
import { useMutation } from "react-query";

import { fetchStripePortal } from "@/_services";
import { CustomSession } from "@/_types";
import { useMessage } from "@/components/ui/message-provider";

import { Button } from "..";

function Billing() {
  const profileText = useTranslations("Profile");
  const navigationText = useTranslations("Navigation");
  const { showMessage } = useMessage();
  const session: any = useSession();
  const safeSession: any = session ? (session as unknown as CustomSession) : null;

  const fetchStripePortalMutation = useMutation(fetchStripePortal, {
    mutationKey: ["fetchStripePortal"],
    onSuccess: (data) => {
      window.location.replace(data.url);
    },
  });

  const handleFetchStripePortal = () => {
    try {
      fetchStripePortalMutation.mutate({ session: safeSession });
    } catch (error) {
      showMessage("error", "ERROR_UPGRADE_ACCOUNT");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <motion.div
      className="w-full max-w-4xl mx-auto p-8 rounded-2xl bg-white/50 dark:bg-slate-800/30 backdrop-blur-sm shadow-lg"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div className="flex items-center gap-3 mb-8" variants={itemVariants}>
        <CreditCard className="w-6 h-6 text-primary-color" />
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-color to-blue-600 bg-clip-text text-transparent">
          {profileText("billing")}
        </h2>
      </motion.div>

      <motion.article className="w-full space-y-6" variants={itemVariants}>
        <motion.div
          className="w-full h-[1px] self-center bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-500 to-transparent"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />

        <motion.p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed" variants={itemVariants}>
          {profileText("billingText")}
        </motion.p>

        <motion.div variants={itemVariants} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button onClick={handleFetchStripePortal} variant={"outline"}>
            <p className="dark:text-white">{navigationText("upgradeButton")}</p>
            <ArrowRight height={16} />
          </Button>
        </motion.div>
      </motion.article>
    </motion.div>
  );
}

export { Billing };
