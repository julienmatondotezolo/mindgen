"use client";
// import { useTranslations } from "next-intl";

// import { BackDropGradient, Button } from "@/components";
import { Navigation } from "@/components/dashboard";
import { BackDropGradient } from "@/components/ui";
import {
  CollaborationSection,
  Footer,
  GenerateDocuments,
  Hero,
  // ImportFeaturesSection,
  MindgenGettingStarted,
  Pricing,
  SignUpSection,
} from "@/sections/";
import { GlobalCursor } from "@/sections/GlobalCursor";

// import { Link } from "../../../navigation";

export default function Index() {
  // const welcomePageText = useTranslations("Welcome");

  return (
    <main className="relative">
      <BackDropGradient />
      <Navigation />
      <Hero />
      <MindgenGettingStarted />
      <CollaborationSection />
      <GenerateDocuments />
      {/* <ImportFeaturesSection /> */}
      <Pricing />
      <SignUpSection />
      <Footer />
      <GlobalCursor />
    </main>
  );
}
