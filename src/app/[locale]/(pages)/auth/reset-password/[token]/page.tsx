"use client";

import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { useTranslations } from "next-intl";
import React, { JSX, useEffect, useState } from "react";
import { useMutation } from "react-query";

import { resetPassword, validateToken } from "@/_services/auth/auth-service";
import { ErrorMessage } from "@/_types/ErrorMessage";
import { BackDropGradient } from "@/components";
import BlurIn from "@/components/ui/blur-in";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link, useRouter } from "@/navigation";

export default function ResetPasswordPage({ params }: { params: { token: string } }): JSX.Element {
  const token: string = params.token;
  const text = useTranslations("Index");
  const authText = useTranslations("Auth");
  const errorText = useTranslations("Error");
  const profileText = useTranslations("Profile");
  const router: AppRouterInstance = useRouter();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [tokenIsValid, setTokenIsValid] = useState<boolean>(false);
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmNewPassword, setConfirmNewPassword] = useState<string>("");
  const [errorMessages, setErrorMessages] = useState<ErrorMessage>();
  const [passwordResetSuccess, setPasswordResetSuccess] = useState<boolean>(false);

  useEffect((): void => {
    if (token) {
      validateToken(token).then((ok: boolean): void => {
        setTokenIsValid(ok);
        setIsLoading(false);
      });
    }
  }, [token]);

  const resetPasswordMutation = useMutation(resetPassword, {
    onSuccess: (data: any) => {
      setNewPassword("");
      setConfirmNewPassword("");

      if (data.status == 200) {
        setPasswordResetSuccess(true);
        router.push("/dashboard");
        return;
      }
    },
  });

  const fieldsValidated = () => {
    const errorMessage: ErrorMessage = {
      errorCode: "",
      errors: [],
      message: "",
    };
    const errors: string[] = [];

    if (newPassword !== confirmNewPassword) {
      errors.push("PASSWORDS_NOT_MATCHING");
    }

    if (newPassword.length < 6) {
      errors.push("PASSWORD_TOO_SHORT");
    }

    errorMessage.errors = errors;
    setErrorMessages(errorMessage);
    return errors.length === 0;
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>, source: string) => {
    switch (source) {
      case "newPassword":
        setNewPassword(event.target.value);
        break;
      case "confirmNewPassword":
        setConfirmNewPassword(event.target.value);
        break;
    }
  };

  async function onSubmit(event: React.SyntheticEvent): Promise<void> {
    event.preventDefault();
    if (fieldsValidated()) {
      try {
        await resetPasswordMutation.mutateAsync({ token, newPassword: confirmNewPassword });
      } catch (error) {
        console.error("Reset password error:", error);
      }
    }
  }

  if (isLoading) {
    return <div className="text-center mt-8">Chargement en cours...</div>;
  }

  if (!tokenIsValid) {
    return (
      <div className="relative w-screen h-screen flex bg-[radial-gradient(ellipse_80%_40%_at_bottom,#C8CFFFFF,#FCFDFFFF_100%)] dark:bg-[radial-gradient(ellipse_50%_30%_at_bottom,#0627FF7F,#00000000_100%)]">
        <BackDropGradient />
        <section className="m-auto md:w-3/4 space-y-4">
          <article className="flex flex-col mb-8 text-center">
            <div className="flex items-center space-x-2 m-auto">
              <BlurIn
                word="419"
                duration={0.3}
                className="md:text-7xl text-5xl font-bold text-primary-color md:text-left"
              />
              <h1 className="md:text-7xl text-5xl bg-gradient-to-b from-black to-[#001e80] dark:from-white dark:to-[#C8CFFFFF] bg-clip-text font-bold tracking-tighter text-transparent md:text-left !leading-normal">
                {errorText("linkExpired")}
              </h1>
            </div>

            <p className="mt-6 text-xl tracking-tight text-[#010d3e] dark:text-primary-foreground default">
              {errorText("linkExpiredDescription")}
            </p>
          </article>
          <section className="w-full text-center">
            <Link href="/">
              <Button>{errorText("backHome")}</Button>
            </Link>
          </section>
        </section>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen flex bg-[radial-gradient(ellipse_80%_40%_at_bottom,#C8CFFFFF,#FCFDFFFF_100%)] dark:bg-[radial-gradient(ellipse_50%_30%_at_bottom,#0627FF7F,#00000000_100%)]">
      <div className="w-full md:w-2/5 m-auto">
        {passwordResetSuccess ? (
          <div className="flex items-center justify-center">
            <svg
              className="w-10 h-10 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="black"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <p className="font-semibold">{authText("passwordResetSuccess")}</p>
          </div>
        ) : (
          <div className="mx-auto p-8 flex w-full flex-col justify-center space-y-6 rounded-3xl border border-white shadow-lg dark:border-slate-800 backdrop-filter backdrop-blur-sm">
            <h1 className="text-3xl font-semibold mb-4">{profileText("changePassword")}</h1>
            <BackDropGradient />
            <form onSubmit={onSubmit} className="space-y-8">
              <div className="grid gap-1 space-y-2">
                <Label htmlFor="newPassword">{authText("passwordInput")}</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder={authText("passwordInput")}
                  disabled={resetPasswordMutation.isLoading}
                  onChange={(e) => handleInputChange(e, "newPassword")}
                />
                {errorMessages?.errors?.includes("PASSWORD_TOO_SHORT") && (
                  <div className="text-red-500 text-sm">{authText("passwordTooShort")}</div>
                )}
              </div>
              <div className="grid gap-1 space-y-2">
                <Label htmlFor="confirmNewPassword">{authText("confirmPasswordInput")}</Label>
                <Input
                  id="confirmNewPassword"
                  type="password"
                  placeholder={authText("confirmPasswordInput")}
                  disabled={resetPasswordMutation.isLoading}
                  onChange={(e) => handleInputChange(e, "confirmNewPassword")}
                />
                {errorMessages?.errors?.includes("PASSWORDS_NOT_MATCHING") && (
                  <div className="text-red-500 text-sm">{authText("passwordsNotMatching")}</div>
                )}
              </div>
              <Button type="submit" disabled={resetPasswordMutation.isLoading}>
                {resetPasswordMutation.isLoading ? text("loading") + "..." : profileText("confirmNewPassword")}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
