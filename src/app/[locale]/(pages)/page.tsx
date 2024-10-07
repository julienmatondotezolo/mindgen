"use client";
// import { useTranslations } from "next-intl";

// import { BackDropGradient, Button } from "@/components";
import { Navigation } from "@/components/dashboard";
import { Hero, Pricing } from "@/sections/";

// import { Link } from "../../../navigation";

export default function Index() {
  // const welcomePageText = useTranslations("Welcome");

  return (
    <>
      <Navigation />
      <Hero />
      <Pricing />
    </>
    // <main className="relative flex min-h-screen flex-col items-center justify-between p-24">
    //   <BackDropGradient />
    //   <Navigation />
    //   <article className="flex flex-col flex-wrap items-center mt-24 space-y-8 text-center">
    //     <h1 className="font-medium text-7xl text-foreground dark:gradientWhiteText">
    //       {welcomePageText("hero1")}
    //       <br />
    //       {welcomePageText("hero2")}
    //     </h1>
    //     <p className="text-grey dark:text-grey-blue sm:w-3/4 w-full">{welcomePageText("heroExplanation")}</p>
    //     <Link href={`/dashboard`}>
    //       <Button className="w-auto">{welcomePageText("heroButton")}</Button>
    //     </Link>
    //   </article>
    // </main>
  );
}
