"use client";

import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import * as React from "react";
import { ChangeEvent, useState } from "react";

import { signUp } from "@/_services/auth/auth-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

export function UserRegisterForm({ className, ...props }: UserAuthFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [errorMessages, setErrorMessages] = useState<string[]>([]);

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
        password: password,
      };

      setIsLoading(true);
      signUp(body).then(async (res: Response) => {
        if (res.ok) {
          setIsLoading(false);
          signIn("credentials", {
            redirect: false,
            username: username,
            password: password,
          }).then((res: any) => {
            if (res.error) {
              setErrorMessages(["Une erreur s'est produise"]);
              return;
            }
            router.replace("/auth/login");
          });
        } else if (res.status == 400) {
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
        <div className="grid gap-2">
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="email">
              Adresse mail
            </Label>
            <Input
              id="email"
              placeholder="Adresse mail"
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
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="username">
              Nom d&apos;utilisateur
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
            {errorMessages.includes("USERNAME_ALREADY_EXISTS") && (
              <div className="text-red-500 text-sm">Nom d&apos;utilisateur déjà pris</div>
            )}
            {errorMessages.includes("USERNAME_TOO_SHORT") && (
              <div className="text-red-500 text-sm">Nom d&apos;utilisateur trop court</div>
            )}
          </div>
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="password">
              Mot de passe
            </Label>
            <Input
              id="password"
              placeholder="Mot de passe"
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
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="password">
              Confirmer le mot de passe
            </Label>
            <Input
              id="password"
              placeholder="Confirmer le mot de passe"
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
          <Button className="bg-m-color text-white hover:bg-green-600" disabled={isLoading}>
            {isLoading ? <p>Loading...</p> : <p>S&apos;inscrire</p>}
          </Button>
        </div>
      </form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Vous avez déjà un compte?</span>
        </div>
      </div>
      <Button
        className="border-m-color text-m-color hover:bg-m-color hover:text-white"
        onClick={() => {
          router.push("/auth/login");
        }}
        variant="outline"
        type="button"
        disabled={isLoading}
      >
        Se connecter
      </Button>
    </div>
  );
}
