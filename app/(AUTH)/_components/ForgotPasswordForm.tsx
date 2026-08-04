"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { Mail } from "lucide-react";
import { getCsrfToken } from "@/lib/csrf-client";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export function ForgotPasswordForm() {
  const [submitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: ForgotPasswordFormValues) {
    setIsSubmitting(true);
    setMessage(null);

    try {
      const csrfToken = await getCsrfToken();

      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify(data),
      });

      const payload = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      setMessage(
        response.ok
          ? payload?.message ?? "If the email exists, reset instructions were sent."
          : payload?.message ?? "Unable to request password reset.",
      );
    } catch {
      setMessage("Unable to reach the authentication service.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col justify-center gap-y-6 max-w-[400px] w-full h-screen sm:h-fit bg-[#2C2C2C]/75 p-8 border border-muted-foreground rounded-md"
      >
        <Logo width={60} height={60} priority />
        <span className="space-y-2">
          <h2 className="text-lg sm:text-3xl lg:text-4xl font-bold">
            Forgot Password
          </h2>
          <p className="text-muted-foreground leading-4">
            Enter your email address to reset your password
          </p>
        </span>

        <div className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-normal">Email Address</FormLabel>
                <FormControl>
                  <span className="relative flex items-center">
                    <Mail className="absolute size-4 text-muted-foreground left-2 translate-y-[1px]" />
                    <Input
                      placeholder="Enter Email Address"
                      {...field}
                      className="border-muted-foreground pl-8"
                    />
                  </span>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {message ? <p className="text-sm text-white/80">{message}</p> : null}

        <div className="flex flex-col gap-y-4">
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? "Sending..." : "Verify"}
          </Button>

          <Button
            variant="link"
            className="text-sm text-white font-normal"
            asChild
          >
            <Link href={"/auth/sign-in"}>Back to Sign In</Link>
          </Button>
        </div>
      </form>
    </Form>
  );
}
