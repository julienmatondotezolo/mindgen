"use client";

import { ArrowLeft, MoveRight } from "lucide-react";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useTranslations } from "next-intl";
import React, { ChangeEvent, useState } from "react";

import { AgreementText, BackDropGradient, Button, Input, Label } from "@/components";
import BlurIn from "@/components/ui/blur-in";
import { useRouter } from "@/navigation";

export default function AuthenticationPage() {
  const router: AppRouterInstance = useRouter();
  const authText = useTranslations("Auth");
  const waitingListText = useTranslations("waitingList");
  const navigationText = useTranslations("Navigation");
  const [, setUsername] = useState<string>("");
  const [, setEmail] = useState<string>("");

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>, source: string) => {
    switch (source) {
      case "username":
        setUsername(event.target.value);
        break;
      case "email":
        setEmail(event.target.value);
        break;
    }
  };

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
  }

  return (
    <>
      <ArrowLeft
        className="absolute left-8 top-4 md:top-8 hover:cursor-pointer z-50"
        onClick={() => {
          router.push("/");
        }}
      />
      <div className="container relative h-screen flex-col items-center">
        <BackDropGradient />

        <div className="hidden md:flex w-full h-full md:dark:bg-[radial-gradient(ellipse_50%_30%_at_bottom,#0627FF7F,#00000000_100%)]">
          <section className="m-auto w-[90%] md:w-6/12 space-y-8">
            <article className="w-full text-center">
              <h1 className="md:text-6xl text-3xl bg-gradient-to-b from-black to-[#001e80] dark:from-white dark:to-[#C8CFFFFF] bg-clip-text font-bold tracking-tighter text-transparent">
                {waitingListText("joinWaitListText")}
              </h1>
              <BlurIn word="Mindgen" duration={0.3} className="md:text-7xl text-5xl font-bold text-primary-color" />
            </article>

            <form className="w-full md:w-4/6 mx-auto" onSubmit={onSubmit}>
              <div className="grid gap-2 space-y-4">
                <div className="grid gap-1 space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    placeholder={authText("usernameInput")}
                    type="text"
                    autoCapitalize="none"
                    autoComplete="username"
                    autoCorrect="off"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(e, "username")}
                    required
                  />
                </div>
                <div className="grid gap-1 space-y-2">
                  <Label htmlFor="username">Email</Label>
                  <Input
                    id="email"
                    placeholder={authText("mailInput")}
                    type="text"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(e, "email")}
                    required
                  />
                </div>
                <Button className="gap-2" type="submit">
                  {navigationText("joinWaitList")}
                  <MoveRight size={20} />
                </Button>
              </div>
            </form>
            <AgreementText />
          </section>
        </div>
      </div>
    </>
  );
}
