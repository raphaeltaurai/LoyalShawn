import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

export const metadata: Metadata = {
  title: "LoyaltyAI - AI-Powered Customer Loyalty Platform",
  description:
    "Transform customer engagement with AI-driven loyalty programs, personalized rewards, and advanced analytics.",
  generator: "LoyaltyAI",
  keywords: ["loyalty program", "customer engagement", "AI analytics", "rewards platform"],
  authors: [{ name: "LoyaltyAI Team" }],
  openGraph: {
    title: "LoyaltyAI - AI-Powered Customer Loyalty Platform",
    description: "Transform customer engagement with AI-driven loyalty programs",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <ErrorBoundary>{children}</ErrorBoundary>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}

function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen">{children}</div>
}
