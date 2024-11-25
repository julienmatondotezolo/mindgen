"use client";

import { useTranslations } from "next-intl";
import React, { ChangeEvent, useEffect, useState } from "react";

import { requestPasswordReset } from "@/_services/auth/auth-service";
import { ErrorMessage } from "@/_types/ErrorMessage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Link } from "@/navigation";

import { BackDropGradient } from "../ui";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function ForgotPasswordForm({ className, ...props }: UserAuthFormProps) {
  const authText = useTranslations("Auth");
  const text = useTranslations("Index");

  const [callbackUrl, setCallbackUrl] = useState<string | null>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [errorMessages, setErrorMessages] = useState<ErrorMessage>();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const callbackUrl = urlParams.get("callbackUrl");

    if (callbackUrl) setCallbackUrl(callbackUrl);
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>, source: string) => {
    switch (source) {
      case "username":
        setEmail(event.target.value);
    }
  };

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    setIsLoading(true);
    try {
      const result = await requestPasswordReset(email);

      if (result.errorCode) {
        setIsLoading(false);
        setErrorMessages(result);
        setEmail("");
        return;
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
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
              disabled={isLoading}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(e, "email")}
            />
          </div>
          {errorMessages?.errorCode === "USER_RETRIEVAL_FAILED" && (
            <div className="text-red-500 text-sm">{errorMessages?.errorCode}</div>
          )}
          <Button type="submit" className="mt-4" disabled={isLoading}>
            {isLoading ? <p>{text("loading")}</p> : <p>{authText("sendCode")}</p>}
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
        <Button className="w-full" variant="outline" type="button" disabled={isLoading}>
          {authText("connectionButton")}
        </Button>
      </Link>
    </div>
  );
}
