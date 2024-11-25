"use client";

import { ArrowLeft } from "lucide-react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { AgreementText, BackDropGradient } from "@/components";
import { UserRegisterForm } from "@/components/authentication/user-register-form";
import BlurIn from "@/components/ui/blur-in";
import { useRouter } from "@/navigation";

export default function AuthenticationPage() {
  const authText = useTranslations("Auth");
  const landingText = useTranslations("landing");
  const router: AppRouterInstance = useRouter();

  return (
    <>
      <ArrowLeft
        className="absolute left-4 top-4 md:left-8 md:top-8 hover:cursor-pointer z-50"
        onClick={() => {
          router.push("/");
        }}
      />
      <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <BackDropGradient />

        <div className="hidden md:flex w-full h-full md:dark:bg-[radial-gradient(ellipse_50%_30%_at_bottom,#0627FF7F,#00000000_100%)]">
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
        </div>

        <div className="w-full md:w-4/5">
          <div className="mx-auto p-8 flex w-full flex-col justify-center space-y-6 rounded-3xl border border-white shadow-lg dark:border-slate-800 backdrop-filter backdrop-blur-sm">
            <div className="flex flex-col space-y-2 text-left">
              <h1 className="text-2xl font-semibold tracking-tight">{authText("register")}</h1>
              {/* <p className="text-sm text-muted-foreground">{authText("registerText")}</p> */}
            </div>
            <UserRegisterForm />
            <AgreementText />
          </div>
        </div>
      </div>
    </>
  );
}
