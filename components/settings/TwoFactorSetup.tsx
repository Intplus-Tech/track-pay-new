"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "../ui/separator";
import { toast } from "sonner";
import { getCsrfToken } from "@/lib/csrf-client";

export function TwoFactorSetup({ initial2fa = false }: { initial2fa?: boolean }) {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(initial2fa);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggle = async (checked: boolean) => {
    setIsLoading(true);
    // Optimistic update
    setTwoFactorEnabled(checked);

    try {
      const csrfToken = await getCsrfToken();
      const response = await fetch("/api/auth/enable-2fa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken,
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to update 2FA status.");
      }

      const data = await response.json();
      console.log("2FA Server Response:", data);

      if (data.twoFactorEnabled !== undefined) {
        setTwoFactorEnabled(data.twoFactorEnabled);
      }

      toast.success(checked ? "2FA enabled successfully" : "2FA disabled successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
      // Revert optimistic update
      setTwoFactorEnabled(!checked);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full border-none shadow-none">
      <CardHeader>
        <CardTitle>2 Factor Authentication</CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="space-y-4 pt-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="2fa-toggle" className="font-medium">
              Two Factor Authentication (2FA)
            </Label>
            <p className="text-sm text-muted-foreground">
              Add an extra layer of security to your account
            </p>
          </div>
          <Switch
            id="2fa-toggle"
            checked={twoFactorEnabled}
            onCheckedChange={handleToggle}
            disabled={isLoading}
          />
        </div>
      </CardContent>
    </Card>
  );
}
