import type { Metadata, Viewport } from "next";
import { Geist, Noto_Naskh_Arabic } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const notoNaskh = Noto_Naskh_Arabic({
  variable: "--font-noto-naskh",
  subsets: ["arabic"],
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Ustadh — Learn Arabic with daily lessons and a voice tutor",
    template: "%s · Ustadh",
  },
  description:
    "Learn Modern Standard Arabic from zero: daily lessons, the alphabet, spaced-repetition review and live voice conversations with an AI tutor.",
  applicationName: "Ustadh",
  openGraph: {
    type: "website",
    siteName: "Ustadh",
    title: "Ustadh — Learn Arabic with daily lessons and a voice tutor",
    description:
      "Daily Arabic lessons, written and spoken, with a voice tutor you can talk to.",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${notoNaskh.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
