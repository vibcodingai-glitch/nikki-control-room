import type { Metadata } from "next";
import { Montserrat, JetBrains_Mono } from "next/font/google";
import { AudioSystemProvider } from "@/components/AudioSystem";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Live Operator Dashboard",
  description: "Live Control Room Experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${montserrat.variable} ${jetbrainsMono.variable} antialiased`}
      >
        <AudioSystemProvider>
          {children}
        </AudioSystemProvider>
      </body>
    </html>
  );
}
