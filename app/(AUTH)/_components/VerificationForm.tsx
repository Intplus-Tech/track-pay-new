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
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { getCsrfToken } from "@/lib/csrf-client";

const verificationSchema = z.object({
  code: z.string().length(6, "Verification code must be 6 characters"),
});

type VerificationFormValues = z.infer<typeof verificationSchema>;

export function VerificationForm({
  email,
}: {
  email: string;
}) {
  const [submitting, setIsSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      code: "",
    },
  });

  async function onSubmit(data: VerificationFormValues) {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const csrfToken = await getCsrfToken();

      const response = await fetch("/api/auth/2fa-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({
          token: data.code,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { message?: string; accessToken?: string }
        | null;

      if (!response.ok) {
        setErrorMessage(payload?.message ?? "Verification failed.");
        return;
      }

      if (payload?.accessToken) {
        router.push("/home/overview");
        router.refresh();
        return;
      }

      setErrorMessage("Unexpected verification response.");
    } catch {
      setErrorMessage("Unable to reach the authentication service.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function resendCode() {
    setResending(true);
    setErrorMessage(null);

    try {
      const csrfToken = await getCsrfToken();

      const response = await fetch("/api/auth/request-2fa-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
      });

      const payload = (await response.json().catch(() => null)) as
        | { message?: string }
        | null;

      if (!response.ok) {
        setErrorMessage(payload?.message ?? "Unable to resend the code.");
      }
    } catch {
      setErrorMessage("Unable to reach the authentication service.");
    } finally {
      setResending(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col justify-center gap-y-6 max-w-[500px] w-full h-screen sm:h-fit bg-[#2C2C2C]/75 p-8 border border-muted-foreground rounded-md"
      >
        <div className="lg:hidden flex">
          <span className="flex items-center gap-2">
            <Logo width={60} height={60} priority />
          </span>
        </div>

        <span className="space-y-2">
          <p className="text-lg sm:text-3xl lg:text-4xl font-bold">
            Enter Your <br className="hidden lg:block" />
            Verification Code
          </p>
          <p className="text-muted-foreground text-sm flex flex-col md:flex-row md:items-center md:gap-2">
            Enter the code sent to your email address
            <br />
            <span className="text-sm text-white">{email}</span>
          </p>
        </span>

        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <InputOTP maxLength={6} {...field}>
                  <InputOTPGroup className="flex gap-2">
                    <InputOTPSlot
                      className="border rounded-md border-muted-foreground"
                      index={0}
                    />
                    <InputOTPSlot
                      className="border rounded-md border-muted-foreground"
                      index={1}
                    />
                    <InputOTPSlot
                      className="border rounded-md border-muted-foreground"
                      index={2}
                    />
                    <InputOTPSlot
                      className="border rounded-md border-muted-foreground"
                      index={3}
                    />
                    <InputOTPSlot
                      className="border rounded-md border-muted-foreground"
                      index={4}
                    />
                    <InputOTPSlot
                      className="border rounded-md border-muted-foreground"
                      index={5}
                    />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-muted-foreground">Didn&apos;t receive code?</p>
          <Button
            type="button"
            variant="link"
            className="text-sm text-white font-normal p-0"
            onClick={resendCode}
            disabled={resending}
          >
            {resending ? "Resending..." : "Resend code"}
          </Button>
        </div>

        {errorMessage ? (
          <p className="text-sm text-red-400">{errorMessage}</p>
        ) : null}

        <Button
          type="submit"
          className="w-full"
          disabled={submitting}
        >
          {submitting ? "Verifying..." : "Verify"}
        </Button>
      </form>
    </Form>
  );
}
