import type { Metadata } from "next";
import Script from "next/script";
import { Fraunces, Plus_Jakarta_Sans } from "next/font/google";
import { AnalyticsBootstrap } from "@/components/analytics/AnalyticsBootstrap";
import { TransitionRoot } from "@/components/transitions/TransitionRoot";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["SOFT", "WONK", "opsz"],
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "Halo — Notice the different versions of your voice",
  description:
    "Halo helps you notice how your voice changes across school, friends, family, passion, and challenge — and how it evolves over time.",
};

const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem("halo-theme");
    var dark = stored === "dark";
    if (!stored) dark = false;
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${jakarta.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col font-sans">
        <Script
          id="halo-theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeInitScript }}
        />
        <AnalyticsBootstrap />
        <TransitionRoot>{children}</TransitionRoot>
      </body>
    </html>
  );
}
