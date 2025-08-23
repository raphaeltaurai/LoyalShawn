import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, BarChart, Gift, Heart, Shield, Star, Users } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <main className="flex-1">
        <section className="w-full py-24 md:py-36 bg-gradient-to-br from-gray-900 to-gray-800 text-white relative overflow-hidden">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <div className="max-w-3xl mx-auto">
              <div className="inline-block bg-white/10 rounded-full px-4 py-1 text-sm font-semibold mb-4 animate-in fade-in-0 slide-in-from-top-4 duration-1000">
                ✨ Now with location-based check-ins & AI insights
              </div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent animate-in fade-in-0 slide-in-from-top-8 duration-1000">
                Build Smarter Loyalty Experiences
              </h1>
              <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto animate-in fade-in-0 slide-in-from-top-12 duration-1000">
                Personalized programs, real-time rewards, and adaptive offers across locations and channels.
              </p>
              <div className="mt-8 flex justify-center gap-4 animate-in fade-in-0 slide-in-from-top-16 duration-1000">
                <Link href="/dashboard" className={buttonVariants({ size: "lg", className: "bg-blue-500 hover:bg-blue-600 text-black" })}>
                  Get Started <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link href="#features" className={buttonVariants({ size: "lg", variant: "outline", className: "text-white border-white/50 hover:bg-white/10" })}>
                  Learn More
                </Link>
              </div>
            </div>
          </div>
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[40rem] h-[40rem] bg-blue-500/20 blur-[120px] rounded-full" />
          </div>
        </section>

        <section id="features" className="w-full py-20 md:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tighter">Why Choose LoyaltyAI?</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Everything you need to create a world-class loyalty program that drives growth and retention.
              </p>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              <FeatureCard icon={<Heart className="h-8 w-8 text-blue-500" />} title="AI Personalization" description="Unique rewards and journeys tailored to each customer." />
              <FeatureCard icon={<BarChart className="h-8 w-8 text-blue-500" />} title="Analytics" description="Insights into behavior, campaigns, and ROI." />
              <FeatureCard icon={<Gift className="h-8 w-8 text-blue-500" />} title="Flexible Rewards" description="Points, tiers, milestones, and service benefits." />
              <FeatureCard icon={<Users className="h-8 w-8 text-blue-500" />} title="Omnichannel" description="Engage across web, mobile, and in-store." />
              <FeatureCard icon={<Shield className="h-8 w-8 text-blue-500" />} title="Secure" description="Multi-tenant isolation, rate limits, and audit logs." />
              <FeatureCard icon={<Star className="h-8 w-8 text-blue-500" />} title="Delightful UX" description="Clean, fast, and engaging experiences." />
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full py-6 border-t border-border/50">
        <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} LoyaltyAI. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy Policy</Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description }) {
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


