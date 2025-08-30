import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth-provider"
import { Header } from "@/components/header"
import "./globals.css"

export const metadata = {
  title: "LoyaltyAI - AI-Powered Customer Loyalty Platform",
  description:
    "Transform customer engagement with AI-driven loyalty programs, personalized rewards, and advanced analytics.",
  generator: "LoyaltyAI",
  keywords: ["loyalty program", "customer engagement", "AI analytics", "rewards platform"],
  authors: [{ name: "LoyaltyAI Team" }],
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: "LoyaltyAI - AI-Powered Customer Loyalty Platform",
    description: "Transform customer engagement with AI-driven loyalty programs",
    type: "website",
  },
}

export default function RootLayout({ children }) {
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
        <script src='https://cdn.jotfor.ms/agent/embedjs/0198f7bfc2da79ba9ef2aabf3d8c620fdc0d/embed.js'></script>
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <Header />
            <ErrorBoundary>{children}</ErrorBoundary>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

function ErrorBoundary({ children }) {
  return <div className="min-h-screen pt-16">{children}</div>
}


