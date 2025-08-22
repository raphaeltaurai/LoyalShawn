import { AuthWrapper } from "@/components/auth-wrapper"
import { LoyaltyDashboard } from "@/components/loyalty-dashboard"

export default function HomePage() {
  return (
    <AuthWrapper>
      <LoyaltyDashboard />
    </AuthWrapper>
  )
}
