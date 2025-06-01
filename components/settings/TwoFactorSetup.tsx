'use client'

import { useState } from "react"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "../ui/separator"

export function TwoFactorSetup() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true)
  const [emailAddress, setEmailAddress] = useState("")
  const [password, setPassword] = useState("")

  return (
    <Card className="w-full border-none shadow-none p-0">
      <CardHeader>
        <CardTitle>2 Factor Authentication</CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="2fa-toggle" className="text-sm font-normal">
            Two Factor Authentication (2FA)
          </Label>
          <Switch
            id="2fa-toggle"
            checked={twoFactorEnabled}
            onCheckedChange={setTwoFactorEnabled}
          />
        </div>

        {twoFactorEnabled && (
          <div className="flex flex-col gap-6 pt-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <Button className="w-full bg-blue-600 hover:bg-blue-700">
              Update Password
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}