"use client";

import { ArrowLeft } from "lucide-react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useTranslations } from "next-intl";

import { AgreementText, BackDropGradient } from "@/components";
import { ForgotPasswordForm } from "@/components/authentication/forgot-password-form";
import { useRouter } from "@/navigation";

export default function AuthenticationPage() {
  const authText = useTranslations("Auth");
  const router: AppRouterInstance = useRouter();

  return (
    <>
      <ArrowLeft
        className="absolute left-8 top-4 md:top-8 hover:cursor-pointer z-50"
        onClick={() => {
          router.back();
        }}
      />
      <div className="container relative h-screen flex-col items-center justify-center grid lg:px-0 bg-[radial-gradient(ellipse_80%_40%_at_bottom,#C8CFFFFF,#FCFDFFFF_100%)] dark:bg-[radial-gradient(ellipse_50%_30%_at_bottom,#0627FF7F,#00000000_100%)]">
        {/* <BackDropGradient /> */}

        {/* <div className="hidden md:flex w-full h-full md:dark:bg-[radial-gradient(ellipse_50%_30%_at_bottom,#0627FF7F,#00000000_100%)]">
          <article className="m-auto w-[90%] md:w-3/4">
            <h1 className="md:text-7xl text-5xl bg-gradient-to-b from-black to-[#001e80] dark:from-white dark:to-[#C8CFFFFF] bg-clip-text font-bold tracking-tighter text-transparent text-center md:text-left">
              {landingText("title")}
            </h1>
            <BlurIn
              word="Mindgen"
              duration={0.3}
              className="md:text-7xl text-5xl font-bold text-primary-color text-center md:text-left"
            />

            <p className="hidden md:block mt-6 text-xl tracking-tight text-[#010d3e] dark:text-primary-foreground default">
              {landingText("description")}
            </p>
          </article>
        </div> */}

        <div className="w-full md:w-4/5 m-auto">
          <div className="mx-auto p-8 flex w-full flex-col justify-center space-y-6 rounded-3xl border border-white shadow-lg dark:border-slate-800 backdrop-filter backdrop-blur-sm">
            <div className="flex flex-col space-y-2 text-left">
              <h1 className="text-2xl font-semibold tracking-tight">{authText("forgotPassword")}</h1>
              <p className="text-sm text-muted-foreground">{authText("forgotPasswordText")}</p>
            </div>
            <ForgotPasswordForm />
            <AgreementText />
          </div>
        </div>
      </div>
    </>
  );
}
