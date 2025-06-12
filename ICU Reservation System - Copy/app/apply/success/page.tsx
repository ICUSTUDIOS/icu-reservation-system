import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Clock, Mail, Home } from "lucide-react"

export default function ApplicationSuccessPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="absolute inset-0 bg-[url('/dark-abstract-studio.png')] bg-center bg-cover opacity-5 mix-blend-soft-light"></div>
      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <CheckCircle className="h-16 w-16 text-emerald-500" />
          </div>
          <h1 className="text-4xl font-bold mb-4 text-foreground">
            Application Submitted Successfully!
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Thank you for your interest in joining ICU Creative Studio 1. We've received your application and will review it carefully.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Clock className="h-5 w-5 text-primary" />
                What's Next?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm flex items-center justify-center mt-0.5">1</div>
                  <div>
                    <p className="font-medium text-foreground">Application Review</p>
                    <p className="text-sm">Our team will carefully review your application and responses.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/80 text-primary-foreground text-sm flex items-center justify-center mt-0.5">2</div>
                  <div>
                    <p className="font-medium text-foreground">Decision & Contact</p>
                    <p className="text-sm">We'll reach out via email with our decision and next steps.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white text-sm flex items-center justify-center mt-0.5">3</div>
                  <div>
                    <p className="font-medium text-foreground">Onboarding</p>
                    <p className="text-sm">If approved, we'll guide you through the membership setup process.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Mail className="h-5 w-5 text-primary" />
                Timeline & Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="font-medium text-foreground mb-2">Expected Response Time</p>
                  <p className="text-sm">
                    We typically review applications within <span className="text-emerald-600 font-medium">5-7 business days</span>. 
                    You'll receive an email notification once we've made a decision.
                  </p>
                </div>
                
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="font-medium text-foreground mb-2">Questions?</p>
                  <p className="text-sm">
                    If you have any questions about your application or our process, 
                    feel free to contact us at{" "}
                    <a href="mailto:studio@cs1.icu" className="text-primary hover:text-primary/80 underline">
                      studio@cs1.icu
                    </a>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-center mt-12">
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link href="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
