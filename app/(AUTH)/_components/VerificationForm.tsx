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
import Link from "next/link";
import Logo from "@/components/Logo";

const verificationSchema = z.object({
  code: z.string().length(6, "Verification code must be 6 characters"),
});

type VerificationFormValues = z.infer<typeof verificationSchema>;

export function VerificationForm({ email }: { email: string }) {
  const [submitting, setIsSubmitting] = useState(false);

  const form = useForm<VerificationFormValues>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      code: "",
    },
  });

  function onSubmit(data: VerificationFormValues) {
    setIsSubmitting(true);
    console.log(data);
    // Handle verification logic here
    setIsSubmitting(false);
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

        <div className="flex items-center">
          <p className="text-muted-foreground mr-2">
            Didn&apos;t Received Code?
          </p>
          <Button
            variant="link"
            className="text-sm text-white font-normal p-0"
            asChild
          >
            <Link href="#">
              Resend Code?{" "}
              <span className="text-muted-foreground font-bold">(30s)</span>
            </Link>
          </Button>
        </div>

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Verifying..." : "Sign in"}
        </Button>
      </form>
    </Form>
  );
}
