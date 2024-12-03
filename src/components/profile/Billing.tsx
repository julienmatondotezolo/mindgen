import { useTranslations } from "next-intl";
import React from "react";
import { motion } from "framer-motion";
import { CreditCard } from "lucide-react";

import { Button } from "..";

function Billing() {
  const profileText = useTranslations("Profile");
  const navigationText = useTranslations("Navigation");

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <motion.div 
      className="w-full max-w-4xl mx-auto p-8 rounded-2xl bg-white/50 dark:bg-slate-800/30 backdrop-blur-sm shadow-lg"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div 
        className="flex items-center gap-3 mb-8"
        variants={itemVariants}
      >
        <CreditCard className="w-6 h-6 text-primary-color" />
        <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-color to-blue-600 bg-clip-text text-transparent">
          {profileText("billing")}
        </h2>
      </motion.div>

      <motion.article 
        className="w-full space-y-6"
        variants={itemVariants}
      >
        <motion.div 
          className="w-full h-[1px] self-center bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-500 to-transparent"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />

        <motion.p 
          className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed"
          variants={itemVariants}
        >
          {profileText("billingText")}
        </motion.p>
        
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button 
            variant="outline"
            className="group relative overflow-hidden transition-all duration-300 hover:border-primary-color"
          >
            <span className="relative z-10 flex items-center gap-2">
              <span className="group-hover:text-primary-color transition-colors">
                {navigationText("upgradeButton")}
              </span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </span>
          </Button>
        </motion.div>
      </motion.article>
    </motion.div>
  );
}

export { Billing };
