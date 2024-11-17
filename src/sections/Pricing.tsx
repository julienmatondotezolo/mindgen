"use client";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useMutation, useQuery } from "react-query";
import { twMerge } from "tailwind-merge";

import { fetchPaymentProducts, fetchStripeCheckout } from "@/_services";
import { CustomSession, SubscriptionPlan } from "@/_types";
import { Button } from "@/components";

// const pricingTiers = [
//   {
//     title: "Free",
//     monthlyPrice: 0,
//     buttonText: "Get started for free",
//     popular: false,
//     inverse: false,
//     features: [
//       "Up to 5 project members",
//       "Unlimited tasks and projects",
//       "2GB storage",
//       "Integrations",
//       "Basic support",
//     ],
//   },
//   {
//     title: "Pro",
//     monthlyPrice: 9,
//     buttonText: "Sign up now",
//     popular: true,
//     inverse: true,
//     features: [
//       "Up to 50 project members",
//       "Unlimited tasks and projects",
//       "50GB storage",
//       "Integrations",
//       "Priority support",
//       "Advanced support",
//       "Export support",
//     ],
//   },
//   {
//     title: "Business",
//     monthlyPrice: 19,
//     buttonText: "Sign up now",
//     popular: false,
//     inverse: false,
//     features: [
//       "Up to 5 project members",
//       "Unlimited tasks and projects",
//       "200GB storage",
//       "Integrations",
//       "Dedicated account manager",
//       "Custom fields",
//       "Advanced analytics",
//       "Export capabilities",
//       "API access",
//       "Advanced security features",
//     ],
//   },
// ];

function Pricing() {
  const router = useRouter();
  const session: any = useSession();
  const safeSession = session ? (session as unknown as CustomSession) : null;

  const urlParams = new URLSearchParams(window.location.search);
  const checkout = urlParams.get("checkout");

  const { data: paymentProducts, isLoading } = useQuery("paymentProducts", fetchPaymentProducts, {
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });

  const stripeCheckout = useMutation(fetchStripeCheckout, {
    onSuccess: async (data: any) => {
      if (data) {
        router.push(data.url);
      }
    },
  });

  useEffect(() => {
    if (checkout) {
      stripeCheckout.mutate({ session: safeSession, priceId: checkout });
    }
  }, [checkout, safeSession, stripeCheckout]);

  if (isLoading) {
    return <section className="py-64">Loading...</section>;
  }

  const handleCheckout = (priceId: string) => {
    if (!safeSession?.data?.session) {
      const base = window.location.origin;
      const currentLocale = window.location.pathname.split("/")[1];

      const url = new URL(`${currentLocale}/auth/login`, base);

      url.searchParams.set("callbackUrl", `/${currentLocale}?checkout=${priceId}`);

      router.push(url.pathname + url.search);
      return;
    }

    stripeCheckout.mutate({ session: safeSession, priceId });
  };

  if (stripeCheckout.isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white shadow-lg backdrop-filter backdrop-blur-lg dark:border dark:bg-slate-600 dark:bg-opacity-20 dark:border-slate-800 p-4 rounded-lg text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-color mx-auto mb-2"></div>
          <p>Redirecting to checkout...</p>
        </div>
      </div>
    );
  }

  if (paymentProducts)
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
            {paymentProducts.map((product: SubscriptionPlan, index: number) => (
              <div
                key={index}
                className={twMerge("card", product.name === "Premium" && "border-4 border-t-8 border-primary-color")}
              >
                <div className="flex justify-between">
                  <h3 className={twMerge("text-lg font-bold text-primary-color/50")}>{product.name}</h3>
                  {product.name === "Premium" && (
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
                  <span className="text-4xl font-bold leading-none tracking-tighter">
                    € {product.prices[0].unitAmount}
                  </span>
                  <span className="font-bold tracking-tight text-black/50 dark:text-white">/month</span>
                </div>
                <Button
                  onClick={() => handleCheckout(product.prices[0].id)}
                  className={twMerge("mt-[30px] w-full")}
                  disabled={stripeCheckout.isLoading}
                >
                  {stripeCheckout.isLoading ? "Loading..." : "Sign up now"}
                </Button>
                <ul className="mt-8 flex flex-col gap-5">
                  <li className="flex items-center gap-4 text-sm">
                    <Check size={6} />
                    <span>
                      Total mindmap: <b>{product.maxMindmaps}</b>
                    </span>
                  </li>
                  <li className="flex items-center gap-4 text-sm">
                    <Check size={6} />
                    <span>
                      Monthly credits: <b>{product.maxCredits}</b>
                    </span>
                  </li>
                  {/* {tier.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-4 text-sm">
                      <Check size={6} />
                      <span>{feature}</span>
                    </li>
                  ))} */}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
}

export { Pricing };
