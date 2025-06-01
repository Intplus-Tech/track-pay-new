"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "../ui/separator";

export function UpdatePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <Card className="w-full border-none shadow-none p-0">
      <CardHeader>
        <CardTitle>Update Password</CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="old-password">Old Password</Label>
          <Input
            id="old-password"
            type="password"
            placeholder="Enter your old password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="new-password">New Password</Label>
          <Input
            id="new-password"
            type="password"
            placeholder="Enter your new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password">New Password</Label>
          <Input
            id="confirm-password"
            type="password"
            placeholder="Re-enter your new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <Button className="w-full bg-blue-600 hover:bg-blue-700">
          Update Password
        </Button>
      </CardContent>
    </Card>
  );
}
