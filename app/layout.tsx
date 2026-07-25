import type { Metadata, Viewport } from "next";
import { Caveat } from "next/font/google";
import "./globals.css";

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-handwritten",
});

export const metadata: Metadata = {
  title: "Paco's Friday Meows",
  description: "A weekly Instagram Stories hero starring Paco the ginger cat.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${caveat.variable} h-dvh w-full overflow-hidden bg-black antialiased`}>
        {children}
      </body>
    </html>
  );
}
