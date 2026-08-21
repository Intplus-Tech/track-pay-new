"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { UpdatePassword } from "@/components/settings/UpdatePassword";
import { BranchConfiguration } from "@/components/settings/BranchConfiguration";
import { NotificationSMS } from "@/components/settings/NotificationSMS";
import { TwoFactorSetup } from "@/components/settings/TwoFactorSetup";
import { Separator } from "../ui/separator";

const components = [
  { id: "password", name: "Update Password", component: UpdatePassword },
  { id: "2fa", name: "2 Factor Authentication", component: TwoFactorSetup },
  { id: "branch", name: "Branch Configuration", component: BranchConfiguration },
  { id: "notification", name: "Notification", component: NotificationSMS },
];

function SettingsContent({ initial2fa }: { initial2fa?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tabQuery = searchParams.get("tab");
  const defaultIndex = components.findIndex((c) => c.id === tabQuery);
  const initialIndex = defaultIndex !== -1 ? defaultIndex : 0;

  const [selectedComponent, setSelectedComponent] = useState(initialIndex);

  useEffect(() => {
    const idx = components.findIndex((c) => c.id === searchParams.get("tab"));
    if (idx !== -1 && idx !== selectedComponent) {
      setSelectedComponent(idx);
    }
  }, [searchParams, selectedComponent]);

  const handleTabChange = (index: number) => {
    setSelectedComponent(index);
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", components[index].id);
    // Use router.push so it adds to history, or router.replace to not clutter history
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const SelectedComponent = components[selectedComponent].component;

  return (
    <div className="flex w-full items-start gap-6">
      {/* Navigation */}
      <div className="border min-w-[300px] h-full md:min-h-[450px] bg-background">
        {components.map((comp, index) => (
          <div key={comp.id}>
            <Button
              className={`rounded-none hover:bg-muted w-full h-12 justify-start bg-background text-foreground ${selectedComponent === index ? "text-primary bg-background" : ""}`}
              onClick={() => handleTabChange(index)}
            >
              {comp.name}
            </Button>
            <Separator />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="border p-4 w-full h-full bg-background">
        <SelectedComponent initial2fa={initial2fa} />
      </div>
    </div>
  );
}

export default function Settings({ initial2fa }: { initial2fa?: boolean }) {
  return (
    <Suspense fallback={<div className="flex w-full min-h-[450px]" />}>
      <SettingsContent initial2fa={initial2fa} />
    </Suspense>
  );
}
