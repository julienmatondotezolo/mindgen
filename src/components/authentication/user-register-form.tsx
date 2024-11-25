"use client";

import { signIn } from "next-auth/react";
import { useTranslations } from "next-intl";
import React, { ChangeEvent, useEffect, useState } from "react";

import { signUp } from "@/_services/auth/auth-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Link, useRouter } from "@/navigation";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UserRegisterForm({ className, ...props }: UserAuthFormProps) {
  const authText = useTranslations("Auth");

  const router = useRouter();
  const [callbackUrl, setCallbackUrl] = useState<string | null>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const callbackUrl = urlParams.get("callbackUrl");

    if (callbackUrl) setCallbackUrl(callbackUrl);
  }, []);

  const fieldsValidated = () => {
    const newErrorMessages: string[] = [];

    if (password !== confirmPassword) {
      newErrorMessages.push("PASSWORDS_NOT_MATCHING");
    }

    if (password.length < 8) {
      newErrorMessages.push("PASSWORD_TOO_SHORT");
    }

    if (username === "" || username.length < 4) {
      newErrorMessages.push("USERNAME_TOO_SHORT");
    }

    if (email === "") {
      newErrorMessages.push("EMAIL_EMPTY");
    }

    setErrorMessages(newErrorMessages);
    return newErrorMessages.length === 0;
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>, source: string) => {
    switch (source) {
      case "username":
        setUsername(event.target.value);
        break;
      case "password":
        setPassword(event.target.value);
        break;
      case "confirmPassword":
        setConfirmPassword(event.target.value);
        break;
      case "email":
        setEmail(event.target.value);
        break;
    }
  };

  async function onSubmit(event: React.SyntheticEvent) {
    event.preventDefault();
    if (fieldsValidated()) {
      const body = {
        username: username,
        email: email,
        preferredLanguage: "ENGLISH",
        referralCode: null,
        password: password,
      };

      setIsLoading(true);
      signUp(body).then(async (res: Response) => {
        if (res) {
          setIsLoading(false);
          signIn("credentials", {
            redirect: false,
            username: username,
            password: password,
          }).then((res: any) => {
            if (res.error) {
              setErrorMessages(["bad credentials"]);
              return;
            }
            if (callbackUrl) {
              window.location.href = callbackUrl;
            } else {
              router.push("/auth/login");
            }
          });
        } else {
          setIsLoading(false);
          const errors = await res.json();

          setErrorMessages((prevErrors: string[]) => [...prevErrors, ...errors]);
        }
      });
    }
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
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
            {errorMessages.includes("EMAIL_ALREADY_EXISTS") && (
              <div className="text-red-500 text-sm">Adresse mail déjà utilisé</div>
            )}
          </div>
          <div className="grid gap-1 space-y-2">
            <Label htmlFor="username">Nom d&apos;utilisateur</Label>
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
            {errorMessages.includes("USERNAME_ALREADY_EXISTS") && (
              <div className="text-red-500 text-sm">Nom d&apos;utilisateur déjà pris</div>
            )}
            {errorMessages.includes("USERNAME_TOO_SHORT") && (
              <div className="text-red-500 text-sm">Nom d&apos;utilisateur trop court</div>
            )}
          </div>
          <div className="grid gap-1 space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              placeholder={authText("passwordInput")}
              type="password"
              autoCapitalize="none"
              autoComplete="password"
              autoCorrect="off"
              disabled={isLoading}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(e, "password")}
            />
            {errorMessages.includes("PASSWORD_TOO_SHORT") && (
              <div className="text-red-500 text-sm">Mot de passe trop court</div>
            )}
          </div>
          <div className="grid gap-1 space-y-2">
            <Label htmlFor="password">Confirmer le mot de passe</Label>
            <Input
              id="password"
              placeholder={authText("confirmPasswordInput")}
              type="password"
              autoCapitalize="none"
              autoComplete="password"
              autoCorrect="off"
              disabled={isLoading}
              onChange={(e: ChangeEvent<HTMLInputElement>) => handleInputChange(e, "confirmPassword")}
            />
            {errorMessages.includes("PASSWORDS_NOT_MATCHING") && (
              <div className="text-red-500 text-sm">Les mots de passe ne correspondent pas</div>
            )}
          </div>
          <Button type="submit" className="mt-4" disabled={isLoading}>
            {isLoading ? <p>Loading...</p> : <p>{authText("registerButton")}</p>}
          </Button>
        </div>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">{authText("alreadyAccount")}</span>
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
