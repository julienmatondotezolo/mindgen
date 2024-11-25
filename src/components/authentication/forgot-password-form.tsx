"use client";

import { useTranslations } from "next-intl";
import React, { ChangeEvent, useEffect, useState } from "react";
import { useMutation } from "react-query";

import { requestPasswordReset } from "@/_services/auth/auth-service";
import { ErrorMessage } from "@/_types/ErrorMessage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Link, useRouter } from "@/navigation";

import { BackDropGradient } from "../ui";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ForgotPasswordForm({ className, ...props }: UserAuthFormProps) {
  const authText = useTranslations("Auth");
  const text = useTranslations("Index");
  const router = useRouter();

  const [callbackUrl, setCallbackUrl] = useState<string | null>("");
  const [email, setEmail] = useState<string>("");
  const [errorMessages, setErrorMessages] = useState<ErrorMessage>();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const callbackUrl = urlParams.get("callbackUrl");

    if (callbackUrl) setCallbackUrl(callbackUrl);
  }, []);

  // Define the mutation
  const requestPasswordResetMutation = useMutation(requestPasswordReset, {
    onSuccess: (data) => {
      setEmail("");

      if (data.status == 200) {
        router.push("/dashboard");
        return;
      }

      setErrorMessages(data);
      console.error("data:", data);
      return;
    },
  });

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    if (email) {
      try {
        const passwordResetBody = {
          email: email,
        };
        const result = await requestPasswordResetMutation.mutateAsync({ passwordResetBody });

        if (result.errorCode) {
          setErrorMessages(result);
          return;
        }
      } catch (error) {
        console.error("Login error:", error);
      }
    } else {
      alert("Fill in email");
    }
  }

  return (
    <div className={cn("grid gap-6 ", className)} {...props}>
      <BackDropGradient />
      <form onSubmit={onSubmit}>
        <div className="grid gap-2 space-y-4">
          <div className="grid gap-1 space-y-2">
            <Label htmlFor="email">Adresse mail</Label>
            <Input
              id="email"
              placeholder={authText("mailInput")}
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={requestPasswordResetMutation.isLoading}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(e)}
            />
          </div>
          {errorMessages?.errorCode === "USER_RETRIEVAL_FAILED" && (
            <div className="text-red-500 text-sm">{errorMessages?.errorCode}</div>
          )}
          <Button type="submit" className="mt-4" disabled={requestPasswordResetMutation.isLoading}>
            {requestPasswordResetMutation.isLoading ? <p>{text("loading")}</p> : <p>{authText("sendCode")}</p>}
          </Button>
        </div>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">{authText("rememberPassword")}</span>
        </div>
      </div>
      <Link href={`/auth/login${callbackUrl ? "?callbackUrl=" + callbackUrl : ""}`}>
        <Button className="w-full" variant="outline" type="submit" disabled={requestPasswordResetMutation.isLoading}>
          {requestPasswordResetMutation.isLoading ? text("loading") : authText("connectionButton")}
        </Button>
      </Link>
    </div>
  );
}
