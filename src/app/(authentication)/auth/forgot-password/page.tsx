"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { JSX, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { requestPasswordReset } from "@/_services/auth/auth-service";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const formSchema = z.object({
  email: z.string(),
});

export default function ResetPasswordPage(): JSX.Element {
  const [showConfirmationMessage, setShowConfirmationMessage] = useState<boolean>(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    requestPasswordReset(values.email).then((ok: boolean): void => {
      if (ok) {
        setShowConfirmationMessage(true);
      }
    });
  }

  return (
    <div className="flex items-center justify-center h-screen">
      {showConfirmationMessage ? (
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
          <p className="font-semibold">Un email a été envoyé à l&apos;adresse concernée.</p>
        </div>
      ) : (
        <div>
          <h1 className="text-3xl font-semibold mb-4">Réinitialisation du mot de passe</h1>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="exemple@exemple.com" {...field} />
                    </FormControl>
                    <FormDescription>Entrez l&apos;email associé a votre compte Mindgen.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit">Envoyer</Button>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
}
