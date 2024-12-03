"use client";

import { useTranslations } from "next-intl";

import { BackDropGradient, Button } from "@/components";
import BlurIn from "@/components/ui/blur-in";
import { Link } from "@/navigation";

export default function NotFoundPage() {
  const errorText = useTranslations("Error");

  return (
    <div className="relative h-screen flex flex-col bg-[radial-gradient(ellipse_80%_40%_at_bottom,#C8CFFFFF,#FCFDFFFF_100%)] dark:bg-[radial-gradient(ellipse_50%_30%_at_bottom,#0627FF7F,#00000000_100%)]">
      <BackDropGradient />
      <section className="m-auto md:w-3/4 space-y-4">
        <article className="flex flex-col mb-8 text-center">
          <div className="flex items-center space-x-2 m-auto">
            <BlurIn
              word="404"
              duration={0.3}
              className="md:text-7xl text-5xl font-bold text-primary-color md:text-left"
            />
            <h1 className="md:text-7xl text-5xl bg-gradient-to-b from-black to-[#001e80] dark:from-white dark:to-[#C8CFFFFF] bg-clip-text font-bold tracking-tighter text-transparent md:text-left !leading-normal">
              {errorText("pageNotFound")}
            </h1>
          </div>

          <p className="hidden md:block mt-6 text-xl tracking-tight text-[#010d3e] dark:text-primary-foreground default">
            {errorText("pageNotFoundDescription")}
          </p>
        </article>
        <section className="w-full text-center">
          <Link href="/">
            <Button>{errorText("backHome")}</Button>
          </Link>
        </section>
      </section>
    </div>
  );
}
