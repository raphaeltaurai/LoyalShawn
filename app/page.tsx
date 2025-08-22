import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ArrowRight,
  BarChart,
  Gift,
  Heart,
  Shield,
  Star,
  Users,
} from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-20 md:py-32 bg-gradient-to-br from-gray-900 to-gray-800 text-white relative overflow-hidden">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <div className="max-w-3xl mx-auto">
              <div className="inline-block bg-white/10 rounded-full px-4 py-1 text-sm font-semibold mb-4 animate-in fade-in-0 slide-in-from-top-4 duration-1000">
                🚀 Powered by AI
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent animate-in fade-in-0 slide-in-from-top-8 duration-1000">
                The Future of Customer Loyalty is Here
              </h1>
              <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto animate-in fade-in-0 slide-in-from-top-12 duration-1000">
                LoyaltyAI helps you build unbreakable customer relationships with intelligent, personalized, and seamless loyalty programs.
              </p>
              <div className="mt-8 flex justify-center gap-4 animate-in fade-in-0 slide-in-from-top-16 duration-1000">
                <Link href="/dashboard" className={buttonVariants({ size: "lg", className: "bg-blue-500 hover:bg-blue-600 text-black" })}>
                  Get Started <ArrowRight className="text-4xl md:text-6xl font-bold tracking-tighter bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent animate-in fade-in-0 slide-in-from-top-8 duration-1000" />
                </Link>
                <Link href="#features" className={buttonVariants({ size: "lg", variant: "outline", className: "text-white border-white/50 hover:bg-white/10" })}>
                  Learn More
                </Link>
              </div>
            </div>
          </div>
          <div className="absolute top-0 left-0 w-full h-full bg-grid-white/[0.05] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000_70%,transparent_110%)]"></div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-20 md:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tighter">
                Why Choose LoyaltyAI?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Everything you need to create a world-class loyalty program that drives growth and retention.
              </p>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard
                icon={<Heart className="h-8 w-8 text-blue-500" />}
                title="AI-Powered Personalization"
                description="Deliver unique rewards and experiences tailored to each customer's behavior and preferences."
              />
              <FeatureCard
                icon={<BarChart className="h-8 w-8 text-blue-500" />}
                title="Advanced Analytics"
                description="Gain deep insights into customer behavior, campaign performance, and ROI with our powerful analytics dashboard."
              />
              <FeatureCard
                icon={<Gift className="h-8 w-8 text-blue-500" />}
                title="Flexible Rewards Engine"
                description="Create custom reward rules, tiers, and point systems that align with your business goals."
              />
              <FeatureCard
                icon={<Users className="h-8 w-8 text-blue-500" />}
                title="Omnichannel Engagement"
                description="Engage customers across web, mobile, and in-store channels for a seamless experience."
              />
              <FeatureCard
                icon={<Shield className="h-8 w-8 text-blue-500" />}
                title="Secure & Scalable"
                description="Built with enterprise-grade security and designed to scale with your business from day one."
              />
              <FeatureCard
                icon={<Star className="h-8 w-8 text-blue-500" />}
                title="Top-tier Support"
                description="Our dedicated support team is here to help you every step of the way, from setup to optimization."
              />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-20 md:py-32 bg-gray-800/50">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tighter">
                Ready to Boost Your Customer Loyalty?
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Join hundreds of businesses transforming their customer engagement with LoyaltyAI.
              </p>
              <div className="mt-8">
                <Link href="/dashboard" className={buttonVariants({ size: "lg", className: "bg-blue-500 hover:bg-blue-600 text-black" })}>
                  Sign Up for Free <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 border-t border-border/50">
        <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} LoyaltyAI. All rights reserved.
          </p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Privacy Policy
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <Card className="bg-background/50 hover:bg-background/80 transition-colors duration-300 transform hover:-translate-y-1">
      <CardHeader className="flex flex-row items-center gap-4">
        <div className="bg-blue-500/10 p-3 rounded-full">{icon}</div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}
