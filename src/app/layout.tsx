import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Paper Architect 3.0 - AI-Powered Academic Writing Assistant",
  description: "Transform your research into publication-ready papers with our AI-powered three-step workflow: Blueprint → Compose → Review. Featuring LaTeX support, style mimicry, and critical review simulation.",
  keywords: ["academic writing", "AI assistant", "paper writing", "LaTeX", "research", "publication"],
  authors: [{ name: "Paper Architect Team" }],
  openGraph: {
    title: "Paper Architect 3.0",
    description: "AI-Powered Academic Writing Assistant for Top-tier Publications",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
