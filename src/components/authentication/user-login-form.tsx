"use client";

import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import React, { ChangeEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { Link, useRouter } from "../../navigation";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UserLoginForm({ className, ...props }: UserAuthFormProps) {
  const authText = useTranslations("Auth");
  const text = useTranslations("Index");

  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showBadCredentialsMessage, setShowBadCredentialsMessage] = useState<boolean>(false);

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
    await signIn("credentials", { redirect: false, username: username, password: password }).then((res: any) => {
      setIsLoading(false);
      if (res.error) {
        setShowBadCredentialsMessage(true);
        return;
      }
      setShowBadCredentialsMessage(false);

      router.push("/dashboard");
    });
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={onSubmit}>
        <div className="grid gap-2">
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="username">
              Username
            </Label>
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
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="password">
              Password
            </Label>
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
          <Link href="/auth/forgot-password" target="_blank" className=" underline underline-offset-4">
            <small>{authText("forgotPassword")}?</small>
          </Link>
          <Button disabled={isLoading}>
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
      <Link href={"/auth/register"}>
        <Button className="w-full" variant="outline" type="button" disabled={isLoading}>
          {authText("registerButton")}
        </Button>
      </Link>
    </div>
  );
}
