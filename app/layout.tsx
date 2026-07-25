import type { Metadata, Viewport } from "next";
import "./globals.css";

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
      <body className="h-dvh w-full overflow-hidden bg-black antialiased">
        {children}
      </body>
    </html>
  );
}
