"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { JSX, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { resetPassword, validateToken } from "@/_services/auth/auth-service";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  newPassword: z.string(),
  confirmNewPassword: z.string(),
});

export default function ResetPasswordPage({ params }: { params: { token: string } }): JSX.Element {
  const token: string = params.token;

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [tokenIsValid, setTokenIsValid] = useState<boolean>(false);
  const [passwordMatchError, setPasswordMatchError] = useState<boolean>(false);
  const [passwordResetSuccess, setPasswordResetSuccess] = useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  useEffect((): void => {
    if (token) {
      validateToken(token).then((ok: boolean): void => {
        setTokenIsValid(ok);
        setIsLoading(false);
      });
    }
  }, [token]);

  async function onSubmit(values: z.infer<typeof formSchema>): Promise<void> {
    if (values.newPassword !== values.confirmNewPassword) {
      setPasswordMatchError(true);
      return;
    }

    resetPassword(token, values.newPassword).then((ok: boolean): void => {
      setPasswordResetSuccess(ok);
    });
  }

  if (isLoading) {
    return <div className="text-center mt-8">Chargement en cours...</div>;
  }

  if (!tokenIsValid) {
    return <div className="text-center mt-8">Le lien de réinitialisation du mot de passe n&apos;est pas valide.</div>;
  }

  return (
    <div className="flex items-center justify-center h-screen">
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
          <p className="font-semibold">Votre mot de passe à été changé avec succès.</p>
        </div>
      ) : (
        <div>
          <h1 className="text-3xl font-semibold mb-4">Réinitialisation du mot de passe</h1>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nouveau mot de passe</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="shadcn" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmNewPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmez votre nouveau mot de passe</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="shadcn" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {passwordMatchError && (
                <div className="text-red-500 text-sm">Les mots de passe ne correspondent pas.</div>
              )}
              <Button type="submit">Réinitialiser</Button>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
}
