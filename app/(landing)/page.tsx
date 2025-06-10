import LandingHeader from "@/components/landing/landing-header"
import LandingHero from "@/components/landing/landing-hero"
import FeaturesSection from "@/components/landing/features-section"
import PointsExplainer from "@/components/landing/points-explainer"
import LandingFooter from "@/components/landing/landing-footer"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <LandingHeader />
      <main className="flex-grow">
        <LandingHero />
        <FeaturesSection />
        <PointsExplainer />
      </main>
      <LandingFooter />
    </div>
  )
}
