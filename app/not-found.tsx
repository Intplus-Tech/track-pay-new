import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Logo from "@/components/Logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-auth-bg px-4">
      <div className="fixed inset-0 z-0 bg-[url(/images/bg-image.svg)] bg-cover bg-center bg-no-repeat opacity-20" />

      <div className="relative z-10 flex flex-col items-center gap-6 text-center">
        <Logo width={100} height={90} priority />

        <p className="font-heading text-[7rem] leading-none font-bold text-primary sm:text-[9rem]">
          404
        </p>

        <div className="flex max-w-md flex-col gap-2">
          <h1 className="font-heading text-2xl font-semibold text-white">
            Page not found
          </h1>
          <p className="text-sm text-white/60">
            The page you&apos;re looking for doesn&apos;t exist or may have been
            moved.
          </p>
        </div>

        <Button asChild size="lg" className="mt-2">
          <Link href="/">
            <ArrowLeft />
            Back to home
          </Link>
        </Button>
      </div>
    </main>
  );
}
