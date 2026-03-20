import type { Metadata } from "next";
import { Marcellus, Merriweather } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { JsonLd } from "@/components/JsonLd";
import "./globals.css";

const marcellus = Marcellus({
  variable: "--font-heading",
  weight: "400",
  subsets: ["latin"],
});

const merriweather = Merriweather({
  variable: "--font-body",
  weight: ["300", "400", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://rota-roman-game.netlify.app"),
  title: "Rota - The Game of Rome | Ancient Strategy Game",
  description: "Play Rota, the classic Roman strategy game. Rise from Plebeian to Consul in this atmospheric board game.",
  keywords: ["Rota", "Roman Game", "Terni Lapilli", "Strategy Game", "Abstract Board Game", "Ancient Roman Games", "Tic Tac Toe", "Three Mens Morris"],
  alternates: {
    canonical: 'https://rota-roman-game.netlify.app',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Rota",
    // startupImage is also possible but requires many sizes, keeping it simple for now
  },
  openGraph: {
    title: "Rota - The Game of Rome",
    description: "Outsmart your opponent in this classic game of strategy from the Roman Empire.",
    url: "https://rota-roman-game.netlify.app",
    siteName: "Rota Roman Game",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rota - The Game of Rome",
    description: "Experience the ancient Roman game of Rota. Simple rules, deep strategy.",
  },
  verification: {
    google: "2Pr6D6hdjkh5SuQFZCmGm-tF02E66oXrCkFRA75yIP0",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Game",
  "name": "Rota - The Game of Rome",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/*
          Blocking theme script: runs synchronously before any paint.
          This prevents the flash-of-light-theme when the user has dark mode saved.
          suppressHydrationWarning on <html> is required because the class differs
          between SSR (no class) and the client (potentially "dark").
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = localStorage.getItem('theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (stored === 'dark' || (!stored && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${marcellus.variable} ${merriweather.variable} antialiased bg-[var(--background)] text-[var(--foreground)] font-[family-name:var(--font-body)]`}
      >
        <JsonLd data={jsonLd} />
        <ServiceWorkerRegister />
        {children}
        {process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID && (
          <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID} />
        )}
      </body>
    </html>
  );
}
