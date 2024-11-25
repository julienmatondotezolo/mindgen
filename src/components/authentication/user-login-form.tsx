"use client";

import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import React, { ChangeEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Link, useRouter } from "@/navigation";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UserLoginForm({ className, ...props }: UserAuthFormProps) {
  const router = useRouter();
  const authText = useTranslations("Auth");
  const text = useTranslations("Index");

  const [callbackUrl, setCallbackUrl] = useState<string | null>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showBadCredentialsMessage, setShowBadCredentialsMessage] = useState<boolean>(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const callbackUrl = urlParams.get("callbackUrl");

    if (callbackUrl) setCallbackUrl(callbackUrl);
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>, source: string) => {
    switch (source) {
      case "username":
        setUsername(event.target.value);
        break;
      case "password":
        setPassword(event.target.value);
        break;
    }
  };

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        redirect: false,
        username: username,
        password: password,
      });

      if (result?.error) {
        setShowBadCredentialsMessage(true);
        setIsLoading(false);
        return;
      }

      setShowBadCredentialsMessage(false);

      // Wait for the session to be updated
      // await new Promise((resolve) => setTimeout(resolve, 500));

      // Force a hard redirect using window.location
      if (callbackUrl) {
        window.location.href = callbackUrl;
      } else {
        router.push("/dashboard");
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Login error:", error);
      setIsLoading(false);
    }
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={onSubmit}>
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
              disabled={isLoading}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(e, "username")}
            />
          </div>
          <div className="grid gap-1 space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              placeholder={authText("passwordInput")}
              type="password"
              autoCapitalize="none"
              autoComplete="password"
              autoCorrect="off"
              disabled={isLoading}
              onChange={(e) => handleInputChange(e, "password")}
            />
          </div>
          {showBadCredentialsMessage && <div className="text-red-500 text-sm">{authText("wrongCredentials")}</div>}
          <Link href="/auth/forgot-password" target="_blank" className="underline underline-offset-4">
            <small>{authText("forgotPassword")}?</small>
          </Link>
          <Button type="submit" className="mt-4" disabled={isLoading}>
            {isLoading ? <p>{text("loading")}</p> : <p>{authText("connectionButton")}</p>}
          </Button>
        </div>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">{authText("noAccount")}</span>
        </div>
      </div>
      <Link href={`/auth/register${callbackUrl ? "?callbackUrl=" + callbackUrl : ""}`}>
        <Button className="w-full" variant="outline" type="button" disabled={isLoading}>
          {authText("registerButton")}
        </Button>
      </Link>
    </div>
  );
}
