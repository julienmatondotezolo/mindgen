"use client";
import { ArrowLeft } from "lucide-react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { UserLoginForm } from "@/components/authentication/user-login-form";

export default function AuthenticationPage() {
  const router: AppRouterInstance = useRouter();

  return (
    <>
      <div className="sm:hidden">
        <Image
          src="/examples/authentication-light.png"
          width={1280}
          height={843}
          alt="Authentication"
          className="hidden sm:block dark:hidden"
        />
        <Image
          src="/examples/authentication-dark.png"
          width={1280}
          height={843}
          alt="Authentication"
          className="hidden dark:block"
        />
      </div>
      <div className="container relative h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
        <ArrowLeft
          className="absolute left-4 top-4 md:left-8 md:top-8 hover:cursor-pointer"
          onClick={() => {
            router.push("/");
          }}
        />
        <button
          onClick={() => {
            router.replace("/auth/register");
          }}
          className="absolute right-4 top-4 md:right-8 md:top-8"
        >
          S&apos;inscrire
        </button>
        <div className="relative hidden h-full flex-col bg-black p-10 text-white dark:border-r lg:flex">
          <div className="absolute inset-0 bg-s-color" />
          <div className="relative z-20 flex items-center text-lg font-medium">Mindgen</div>
        </div>
        <div className="lg:p-8">
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">Connexion</h1>
              <p className="text-sm text-muted-foreground">
                Entrez votre nom d&apos;utilisateur et votre mot de passe ci-dessous pour vous connecter.
              </p>
            </div>
            <UserLoginForm />
            <p className="px-8 text-center text-sm text-muted-foreground">
              By clicking continue, you agree to our{" "}
              <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
