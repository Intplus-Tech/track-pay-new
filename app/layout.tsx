import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter, Nunito_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "./providers";
import { cn } from "@/lib/utils";

const nunitoSansHeading = Nunito_Sans({ subsets: ['latin'], variable: '--font-heading' });

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TrackPay",
  description: "Loan reconciliation system",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", inter.variable, nunitoSansHeading.variable)}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-surface-tint`}
      >
        <Providers>
          {children}
          <Toaster position="top-right" duration={4000} visibleToasts={3} closeButton />
        </Providers>
      </body>
    </html>
  );
}
