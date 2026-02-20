import type { Metadata } from "next";
import { Marcellus, Lora } from "next/font/google";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import "./globals.css";

const marcellus = Marcellus({
  variable: "--font-marcellus",
  weight: "400",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Rota - Imperial Senate",
  description: "A classic Roman game strategy game with an Imperial aesthetic.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${marcellus.variable} ${lora.variable} antialiased bg-[var(--background)] text-[var(--foreground)] font-[family-name:var(--font-lora)]`}
      >
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
