import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Urban Spice",
  description: "Scan. Order. Enjoy.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-charcoal-950 text-white antialiased min-h-screen">{children}</body>
    </html>
  );
}
