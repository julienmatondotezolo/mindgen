"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import React, { ChangeEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UserLoginForm({ className, ...props }: UserAuthFormProps) {
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
      router.replace("/");
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
              placeholder="Nom d'utilisateur"
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
              placeholder="Mot de passe"
              type="password"
              autoCapitalize="none"
              autoComplete="password"
              autoCorrect="off"
              disabled={isLoading}
              onChange={(e) => handleInputChange(e, "password")}
            />
          </div>
          {showBadCredentialsMessage && (
            <div className="text-red-500 text-sm">Nom d&apos;utilisateur ou mot de passe incorrect.</div>
          )}
          <Link href="/auth/forgot-password" target="_blank" className=" underline underline-offset-4">
            <small>Mot de passe oublié?</small>
          </Link>
          <Button className="bg-m-color text-white hover:bg-green-600" disabled={isLoading}>
            {isLoading && (
              // <Icons.spinner className="mr-2 h-4 w-4 animate-spin"/>
              <div>loading...</div>
            )}
            Connexion
          </Button>
        </div>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Pas encore de compte?</span>
        </div>
      </div>
      <Button
        className="border-m-color text-m-color hover:bg-m-color hover:text-white"
        onClick={() => router.push("/auth/register")}
        variant="outline"
        type="button"
        disabled={isLoading}
      >
        {isLoading && <div>loading...</div>} Inscrivez-vous!
      </Button>
    </div>
  );
}
