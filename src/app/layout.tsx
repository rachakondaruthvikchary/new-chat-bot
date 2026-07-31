import type { Metadata } from "next";
import "./globals.css";
import ThemeInitScript from "@/components/ThemeInitScript";

export const metadata: Metadata = {
  title: "Converge — AI Chat",
  description: "Your AI thinking partner, converged into one answer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <ThemeInitScript />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
