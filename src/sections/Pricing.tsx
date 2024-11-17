"use client";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { twMerge } from "tailwind-merge";

import { Button } from "@/components";

const pricingTiers = [
  {
    title: "Free",
    monthlyPrice: 0,
    buttonText: "Get started for free",
    popular: false,
    inverse: false,
    features: [
      "Up to 5 project members",
      "Unlimited tasks and projects",
      "2GB storage",
      "Integrations",
      "Basic support",
    ],
  },
  {
    title: "Pro",
    monthlyPrice: 9,
    buttonText: "Sign up now",
    popular: true,
    inverse: true,
    features: [
      "Up to 50 project members",
      "Unlimited tasks and projects",
      "50GB storage",
      "Integrations",
      "Priority support",
      "Advanced support",
      "Export support",
    ],
  },
  {
    title: "Business",
    monthlyPrice: 19,
    buttonText: "Sign up now",
    popular: false,
    inverse: false,
    features: [
      "Up to 5 project members",
      "Unlimited tasks and projects",
      "200GB storage",
      "Integrations",
      "Dedicated account manager",
      "Custom fields",
      "Advanced analytics",
      "Export capabilities",
      "API access",
      "Advanced security features",
    ],
  },
];

function Pricing() {
  return (
    <section className="py-64">
      <div className="container">
        <div className="section-heading">
          <h2 className="section-title bg-gradient-to-b from-black to-[#001e80] dark:from-white dark:to-[#C8CFFFFF] bg-clip-text">
            Pricing
          </h2>
          <p className="section-description mt-5 text-[#010d3e] dark:text-primary-foreground">
            Free forever. Upgrade for unlimited tasks, better security, and exclusive features.
          </p>
        </div>
        <div className="mt-10 flex flex-col items-center gap-6 lg:flex-row lg:items-end lg:justify-center">
          {pricingTiers.map((tier, index) => (
            <div
              key={index}
              className={twMerge("card", tier.inverse === true && "border-4 border-t-8 border-primary-color")}
            >
              <div className="flex justify-between">
                <h3 className={twMerge("text-lg font-bold text-primary-color/50")}>{tier.title}</h3>
                {tier.popular === true && (
                  <div className="inline-flex rounded-xl border bg-white/90 px-4 py-1.5 text-sm">
                    <motion.span
                      className="bg-[linear-gradient(to_right,#dd7ddf,#7D82DFFF,#457792FF,#71c2ef,#326EDDFF,#dd7ddf,#7D82DFFF,#457792FF,#457792FF,#3bffff)] bg-clip-text font-medium text-transparent [background-size:200%]"
                      animate={{ backgroundPositionX: "100%" }}
                      transition={{
                        repeat: Infinity,
                        ease: "linear",
                        repeatType: "loop",
                        duration: 1,
                      }}
                    >
                      Popular
                    </motion.span>
                  </div>
                )}
              </div>
              <div className="mt-[30px] flex items-baseline gap-1">
                <span className="text-4xl font-bold leading-none tracking-tighter">€ {tier.monthlyPrice}</span>
                <span className="font-bold tracking-tight text-black/50 dark:text-white">/month</span>
              </div>
              <Button className={twMerge("mt-[30px] w-full")}>{tier.buttonText}</Button>
              <ul className="mt-8 flex flex-col gap-5">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-4 text-sm">
                    <Check size={6} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export { Pricing };
