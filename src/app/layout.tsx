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
  metadataBase: new URL("https://rota-roman-game.netlify.app"),
  title: "Rota - Imperial Senate | Ancient Roman Strategy Game",
  description: "Play Rota, the classic Roman strategy game of 'Terni Lapilli'. Challenge the CPU or a friend in this atmospheric, Imperial-themed board game.",
  keywords: ["Rota", "Roman Game", "Terni Lapilli", "Strategy Game", "Abstract Board Game", "Ancient Roman Games", "Tic Tac Toe", "Three Mens Morris"],
  openGraph: {
    title: "Rota - Imperial Senate",
    description: "Outsmart your opponent in this classic game of strategy from the Roman Empire.",
    url: "https://rota-roman-game.netlify.app",
    siteName: "Rota Roman Game",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rota - Imperial Senate",
    description: "Experience the ancient Roman game of Rota. Simple rules, deep strategy.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Game",
    "name": "Rota - Imperial Senate",
    "description": "An online version of the ancient Roman board game Rota (Terni Lapilli).",
    "genre": ["Board Game", "Strategy", "Abstract"],
    "url": "https://rota-roman-game.netlify.app",
    "image": "https://rota-roman-game.netlify.app/pwa-icon?size=512",
    "author": {
      "@type": "Person",
      "name": "Jules"
    },
    "audience": {
      "@type": "PeopleAudience",
      "suggestedMinAge": "6"
    }
  };

  return (
    <html lang="en">
      <body
        className={`${marcellus.variable} ${lora.variable} antialiased bg-[var(--background)] text-[var(--foreground)] font-[family-name:var(--font-lora)]`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ServiceWorkerRegister />
        {children}
      </body>
    </html>
  );
}
