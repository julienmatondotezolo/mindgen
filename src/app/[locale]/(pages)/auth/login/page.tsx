"use client";

import { ArrowLeft } from "lucide-react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useTranslations } from "next-intl";

import { BackDropGradient } from "@/components";
import { UserLoginForm } from "@/components/authentication/user-login-form";
import { Link, useRouter } from "@/navigation";

export default function AuthenticationPage() {
  const authText = useTranslations("Auth");

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
        <div className="w-full h-full bg-primary-color gradie"></div>

        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">{authText("connection")}</h1>
              <p className="text-sm text-muted-foreground">{authText("connectionText")}</p>
            </div>
            <UserLoginForm />
            <p className="px-8 text-center text-sm text-muted-foreground">
              {authText("clickAgreement")}{" "}
              <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
                {authText("termsOfService")}
              </Link>{" "}
              &{" "}
              <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
                {authText("privacyPolicy")}
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
