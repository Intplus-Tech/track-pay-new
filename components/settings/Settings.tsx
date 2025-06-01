"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UpdatePassword } from "@/components/settings/UpdatePassword";
import { BranchConfiguration } from "@/components/settings/BranchConfiguration";
import { NotificationSMS } from "@/components/settings/NotificationSMS";
import { TwoFactorSetup } from "@/components/settings/TwoFactorSetup";
import { Separator } from "../ui/separator";

const components = [
  { name: "Update Password", component: UpdatePassword },
  { name: "2 Factor Authentication", component: TwoFactorSetup },
  { name: "Branch Configuration", component: BranchConfiguration },
  { name: "Notification", component: NotificationSMS },
];

export default function SettingsDemo() {
  const [selectedComponent, setSelectedComponent] = useState(0);

  const SelectedComponent = components[selectedComponent].component;

  return (
    <div className="flex w-full items-start gap-6">
      {/* Navigation */}
      <div className="border min-w-[300px] h-full md:min-h-[450px] bg-background">
        {components.map((comp, index) => (
          <div key={index}>
            <Button
              className={`rounded-none hover:bg-muted w-full h-12 justify-start bg-background text-foreground ${selectedComponent === index ? "text-primary bg-background" : ""}`}
              onClick={() => setSelectedComponent(index)}
            >
              {comp.name}
            </Button>
            <Separator />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="border p-4 w-full h-full bg-background">
        <SelectedComponent />
      </div>
    </div>
  );
}
