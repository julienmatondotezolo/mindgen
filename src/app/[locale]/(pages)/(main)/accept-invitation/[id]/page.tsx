"use client";

import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useMutation } from "react-query";

import { acceptOrgInvitation } from "@/_services";
import { CustomSession } from "@/_types";
import { BackDropGradient, Button } from "@/components";
import BlurIn from "@/components/ui/blur-in";
import { Link, useRouter } from "@/navigation";

export default function AcceptInvitationPage({ params }: { params: { id: string } }) {
  const text = useTranslations("Index");
  const router = useRouter();

  const session: any = useSession();
  const safeSession = session ? (session as unknown as CustomSession) : null;

  // Define the mutation
  const acceptOrgInvitationMutation = useMutation(acceptOrgInvitation, {
    onSuccess: (data) => {
      if (data.errors.length > 0) {
        console.error("data:", data);
        return;
      }
      router.push("/dashboard");
    },
  });

  const handleAcceptInvitation = async () => {
    acceptOrgInvitationMutation.mutateAsync({
      session: safeSession,
      invitationId: params.id,
    });
  };

  return (
    <div className="relative h-screen flex flex-col bg-[radial-gradient(ellipse_80%_40%_at_bottom,#C8CFFFFF,#FCFDFFFF_100%)] dark:bg-[radial-gradient(ellipse_50%_30%_at_bottom,#0627FF7F,#00000000_100%)]">
      <BackDropGradient />
      <section className="m-auto md:w-3/4 space-y-4">
        <article className="flex flex-col mb-8 text-center">
          <div className="flex items-center space-x-2 m-auto">
            <BlurIn
              word="Join"
              duration={0.3}
              className="md:text-7xl text-5xl font-bold text-primary-color md:text-left"
            />
            <h1 className="md:text-7xl text-5xl bg-gradient-to-b from-black to-[#001e80] dark:from-white dark:to-[#C8CFFFFF] bg-clip-text font-bold tracking-tighter text-transparent md:text-left !leading-normal">
              mindmap
            </h1>
          </div>

          <p className="hidden md:block mt-6 text-xl text-left md:text-center tracking-tight text-[#010d3e] dark:text-primary-foreground default">
            Click accept to join this mindmap our cancel to go back to the homepage
          </p>
        </article>
        <section className="flex md:justify-center w-full space-x-4">
          <Link href="/">
            <Button variant="outline">{text("cancel")}</Button>
          </Link>
          <Button onClick={handleAcceptInvitation} disabled={acceptOrgInvitationMutation.isLoading}>
            {acceptOrgInvitationMutation.isLoading ? text("loading") : "Accept"}
          </Button>
        </section>
      </section>
    </div>
  );
}
