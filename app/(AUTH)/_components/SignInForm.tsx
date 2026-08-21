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
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import Logo from "@/components/Logo";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { getCsrfToken } from "@/lib/csrf-client";

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean().optional(),
});

type SignInFormValues = z.infer<typeof signInSchema>;

export function SignInForm() {
  const [submitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  async function onSubmit(data: SignInFormValues) {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const csrfToken = await getCsrfToken();

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify(data),
      });

      const payload = (await response.json().catch(() => null)) as
        | {
          message?: string;
          success?: boolean;
          twoFactorRequired?: boolean;
        }
        | null;

      console.log("Login API Response:", payload);

      if (!response.ok) {
        setErrorMessage(payload?.message ?? "Unable to sign in.");
        return;
      }

      if (payload?.twoFactorRequired) {
        router.push("/auth/sign-in/verify");
        return;
      }

      if (payload?.success) {
        router.push("/home/overview");
        router.refresh();
        return;
      }

      setErrorMessage("Unexpected login response.");
    } catch {
      setErrorMessage("Unable to reach the authentication service.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col justify-center gap-y-6 max-w-[500px] w-full h-screen sm:h-fit bg-auth-overlay/75 p-8 border border-muted-foreground rounded-md"
      >
        <div className="lg:hidden flex flex-col">
          <span className="flex items-center gap-2">
            <Logo width={60} height={60} priority />
          </span>
        </div>
        <span className="">
          <h2 className="text-lg sm:text-3xl lg:text-4xl font-bold">
            Sign In <br className="hidden lg:block" />
            to your account
          </h2>
          <p className="text-muted-foreground">
            Enter your details to proceed further
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
                  <Input
                    placeholder="Enter Email Address"
                    {...field}
                    className="border-muted-foreground"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-normal">Your Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter Password"
                      {...field}
                      className="border-muted-foreground"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between">
            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="font-normal">Remember me</FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <Button
              variant="link"
              className="text-sm text-white font-normal"
              asChild
            >
              <Link href="/auth/sign-in/forgot-password">Forgot Password?</Link>
            </Button>
          </div>
        </div>

        {errorMessage ? (
          <p className="text-sm text-destructive">{errorMessage}</p>
        ) : null}

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Signing in..." : "Sign In"}
        </Button>
      </form>
    </Form>
  );
}
