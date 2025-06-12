// This is the working success page that we want to preserve
// Backup created before pulling from main branch

"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle, Clock, Mail, Home } from "lucide-react"

export default function ApplicationSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  useEffect(() => {
    // Redirect if user didn't come from a successful submission
    if (!searchParams.get('submitted')) {
      router.push('/apply')
    }
  }, [router, searchParams])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="absolute inset-0 bg-[url('/dark-abstract-studio.png')] bg-center bg-cover opacity-5 mix-blend-soft-light"></div>
      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Header */}
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

        {/* Main Content */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* What's Next */}
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

          {/* Timeline & Contact */}
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
                    We typically review applications within <span className="text-emerald-600 font-medium">3-5 business days</span>. 
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
                
                <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <p className="font-medium text-amber-700 dark:text-amber-400 mb-1">Important Note</p>
                  <p className="text-sm text-amber-600 dark:text-amber-300">
                    Please check your email regularly (including spam folder) for updates on your application status.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Application Details - Made Smaller */}
        <Card className="max-w-md mx-auto mt-8 bg-card border-border">
          <CardHeader className="pb-4">
            <CardTitle className="text-foreground text-center text-lg">Application Received</CardTitle>
            <CardDescription className="text-center text-sm">
              Your application has been successfully submitted.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center pt-0">
            <div className="p-3 bg-muted/50 rounded-lg inline-block">
              <p className="text-xs text-muted-foreground mb-1">Submission Date</p>
              <p className="text-sm font-medium text-foreground">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Action Button - Only Back to Home */}
        <div className="flex justify-center mt-12">
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link href="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>

        {/* Additional Info */}
        <div className="text-center mt-16 max-w-3xl mx-auto">
          <h3 className="text-2xl font-semibold mb-4 text-foreground">While You Wait...</h3>
          <p className="text-muted-foreground leading-relaxed">
            Feel free to explore our website to learn more about our facilities, community guidelines, 
            and the creative opportunities available at ICU Creative Studio 1. We're excited about the 
            possibility of welcoming you to our creative community!
          </p>
        </div>
      </div>
    </div>
  )
}
