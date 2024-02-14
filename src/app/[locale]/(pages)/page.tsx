"use client";
import { useTranslations } from "next-intl";

import { BackDropGradient, Button } from "@/components";
import { Navigation } from "@/components/dashboard";

export default function Index() {
  const text = useTranslations("Dashboard");

  console.log("text:", text("hero"));
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-between p-24">
      <BackDropGradient />
      <Navigation />
      <article className="flex flex-col flex-wrap items-center mt-24 space-y-8 text-center">
        <h1 className="font-medium text-7xl text-foreground dark:gradientWhiteText">
          Unlock your creativity
          <br />
          with Mindgen
        </h1>
        <p className="text-grey dark:text-grey-blue sm:w-3/4 w-full">
          Organize your thoughts, collaborate seamlessly, and boost productivity with our powerful mindmap SaaS
          platform.
        </p>
        <Button className="w-auto">Get started</Button>
      </article>
    </main>
  );
}
