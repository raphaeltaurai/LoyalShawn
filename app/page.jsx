import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, BarChart, Gift, Heart, Shield, Star, Users, Sparkles, Globe, Target } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <main className="flex-1">
        {/* Hero Section with African Background */}
        <section className="w-full py-24 md:py-36 text-white relative overflow-hidden">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <div 
              className="w-full h-full bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `url('/index.jpg')`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60" />
          </div>

          <div className="container mx-auto px-4 md:px-6 text-center relative z-10">
            <div className="max-w-4xl mx-auto">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-6 py-3 text-sm font-semibold mb-6 animate-in fade-in-0 slide-in-from-top-4 duration-1000 border border-white/20">
                <Sparkles className="h-4 w-4 text-yellow-400" />
                AI-Powered Location-Based Loyalty System
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 animate-in fade-in-0 slide-in-from-top-8 duration-1000">
                <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Transform Customer
                </span>
                <br />
                <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                  Engagement
                </span>
              </h1>
              
              <p className="mt-6 text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto leading-relaxed animate-in fade-in-0 slide-in-from-top-12 duration-1000">
                Design and develop an AI-driven, location-based, multi-tenant Loyalty System that enables organizations across industries to create, manage, and scale intelligent customer engagement programs.
              </p>
              
              <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4 animate-in fade-in-0 slide-in-from-top-16 duration-1000">
                <Link href="/dashboard" className={buttonVariants({ 
                  size: "lg", 
                  className: "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" 
                })}>
                  Start Building <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link href="#features" className={buttonVariants({ 
                  size: "lg", 
                  variant: "outline", 
                  className: "text-white border-white/30 hover:bg-white/10 backdrop-blur-sm px-8 py-4 text-lg font-semibold" 
                })}>
                  Explore Features
                </Link>
              </div>

              {/* Stats Section */}
              <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-blue-400 mb-2">500+</div>
                  <div className="text-gray-300">Organizations</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-purple-400 mb-2">2M+</div>
                  <div className="text-gray-300">Customers Engaged</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-green-400 mb-2">98%</div>
                  <div className="text-gray-300">Retention Rate</div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Elements */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 left-10 w-20 h-20 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
            <div className="absolute top-40 right-20 w-32 h-32 bg-purple-500/20 rounded-full blur-xl animate-pulse delay-1000" />
            <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-green-500/20 rounded-full blur-xl animate-pulse delay-2000" />
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-20 md:py-32 bg-gradient-to-b from-background to-gray-50/50 dark:to-gray-900/50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full px-4 py-2 text-sm font-semibold mb-4">
                <Target className="h-4 w-4" />
                Why Choose LoyaltyAI?
              </div>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tighter mb-6">
                Intelligent Customer Engagement
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Everything you need to create a world-class loyalty program that drives growth, retention, and personalized service delivery across industries.
              </p>
            </div>
            
                         <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
               <FeatureCard 
                 icon={<Heart className="h-8 w-8 text-white" />} 
                 title="AI Personalization" 
                 description="Unique rewards and journeys tailored to each customer using advanced machine learning algorithms."
                 gradient="from-red-500 to-pink-500"
               />
               <FeatureCard 
                 icon={<BarChart className="h-8 w-8 text-white" />} 
                 title="Advanced Analytics" 
                 description="Real-time insights into behavior patterns, campaign performance, and predictive ROI analysis."
                 gradient="from-blue-500 to-cyan-500"
               />
               <FeatureCard 
                 icon={<Gift className="h-8 w-8 text-white" />} 
                 title="Flexible Rewards" 
                 description="Points, tiers, milestones, and service benefits with dynamic reward structures."
                 gradient="from-purple-500 to-violet-500"
               />
               <FeatureCard 
                 icon={<Globe className="h-8 w-8 text-white" />} 
                 title="Location-Based" 
                 description="Geofencing technology for check-ins and location-specific rewards and offers."
                 gradient="from-green-500 to-emerald-500"
               />
               <FeatureCard 
                 icon={<Shield className="h-8 w-8 text-white" />} 
                 title="Multi-Tenant Security" 
                 description="Enterprise-grade security with multi-tenant isolation, rate limits, and comprehensive audit logs."
                 gradient="from-indigo-500 to-blue-500"
               />
               <FeatureCard 
                 icon={<Star className="h-8 w-8 text-white" />} 
                 title="Delightful UX" 
                 description="Clean, fast, and engaging experiences designed for modern customer expectations."
                 gradient="from-yellow-500 to-orange-500"
               />
             </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="w-full py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="container mx-auto px-4 md:px-6 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Ready to Transform Your Customer Engagement?
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Join organizations across industries in creating intelligent, location-based loyalty programs that drive retention and growth.
              </p>
              <Link href="/dashboard" className={buttonVariants({ 
                size: "lg", 
                className: "bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105" 
              })}>
                Get Started Today <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full py-8 border-t border-border/50 bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 md:px-6 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <Star className="h-4 w-4 text-white" />
            </div>
            <p className="text-lg font-semibold">LoyaltyAI</p>
          </div>
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} LoyaltyAI. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description, gradient }) {
  return (
    <Card className="group bg-background/80 hover:bg-background transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl border border-border/50 backdrop-blur-sm">
      <CardHeader className="flex flex-row items-start gap-4 pb-4">
        <div className={`bg-gradient-to-r ${gradient} p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
          <div className="text-white">{icon}</div>
        </div>
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  )
}


