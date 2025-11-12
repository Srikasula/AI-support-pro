import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI-Support Pro — Demo",
  description: "Step 1: Next.js UI with Tailwind",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900">
        <main className="max-w-4xl mx-auto px-4 py-10">{children}</main>
      </body>
    </html>
  );
}
