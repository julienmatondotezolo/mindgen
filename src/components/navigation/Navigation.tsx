"use client";
import { MoveRight, Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui";

import { Link } from "../../navigation";
import { NavProfile } from "./NavProfile";

function Navigation() {
  const { data: session } = useSession();
  const navigationText = useTranslations("Navigation");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
      className={`flex justify-center fixed z-50 top-0 w-full py-3 transition-all duration-300 ${
        scrolled 
          ? "bg-white/80 dark:bg-slate-800/90 backdrop-blur-lg shadow-lg dark:shadow-slate-900/20" 
          : "bg-white/50 dark:bg-slate-800/50 backdrop-blur-md"
      }`}
    >
      <div className="flex justify-between items-center max-w-7xl w-[96%]">
        <motion.section 
          className="flex items-center relative"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Link href={`/dashboard`}>
            <figure className="relative mr-8 group">
              <motion.div 
                className="absolute -top-2 -right-5 bg-primary-color text-white text-[8px] px-2 py-0.5 rounded-full"
                initial={{ scale: 0.8 }}
                animate={{ scale: [0.8, 1.1, 1] }}
                transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 4 }}
              >
                <p className="font-bold tracking-wider">BETA</p>
              </motion.div>
              <p className="font-bold text-lg dark:text-white tracking-tight">
                MIND
                <motion.span 
                  className="text-primary-color inline-block"
                  initial={{ opacity: 0.8 }}
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  GEN
                </motion.span>
              </p>
            </figure>
          </Link>
        </motion.section>

        <div className="flex items-center space-x-6">
          <AnimatePresence>
            {session?.session == undefined && (
              <Link href={`/waitlist`}>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  whileHover={{ scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Button 
                    className="relative overflow-hidden group px-6 py-2 h-11"
                  >
                    <motion.span 
                      className="relative z-10 flex items-center gap-2"
                      whileHover={{ x: 3 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <Sparkles className="w-4 h-4" />
                      {navigationText("joinWaitList")}
                      <MoveRight size={18} />
                    </motion.span>
                  </Button>
                </motion.div>
              </Link>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {session?.session && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <NavProfile />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.nav>
  );
}

export { Navigation };
