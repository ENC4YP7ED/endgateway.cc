import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";

import { LiquidGlassFilter } from "@/components/liquid-glass-filter";
import "./globals.css";

const jetbrainsMono = localFont({
  src: [
    {
      path: "../../public/fonts/JetBrainsMono-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/JetBrainsMono-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const monocraft = localFont({
  src: "../../public/fonts/Monocraft-Regular.ttf",
  variable: "--font-monocraft",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "endgateway.cc",
    template: "%s | endgateway.cc",
  },
  description:
    "Liquid-glass control plane for secure Minecraft tunnel routing, account auth, passkeys, and TOTP security.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${jetbrainsMono.variable} ${monocraft.variable} h-full bg-[var(--page-bg)] antialiased`}
    >
      <body className="min-h-full bg-[var(--page-bg)] text-[var(--ink)]">
        <Script
          src="https://code.iconify.design/iconify-icon/3.0.0/iconify-icon.min.js"
          strategy="beforeInteractive"
        />
        <LiquidGlassFilter />
        {children}
      </body>
    </html>
  );
}
