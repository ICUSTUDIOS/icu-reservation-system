import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import ApplicationForm from "@/components/application-form"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Apply for Membership | ICU Creative Studio 1",
  description: "Apply to join our exclusive creative community at ICU Creative Studio 1.",
}

export default async function ApplicationPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If user is already logged in, check if they're already a member or have an existing application
  if (user) {
    // Check if user is already a member
    const { data: member } = await supabase
      .from('members')
      .select('*')
      .eq('auth_id', user.id)
      .single()

    if (member) {
      redirect("/dashboard")
    }

    // Check if user already has an application
    const { data: existingApplication } = await supabase
      .from('applications')
      .select('*')
      .eq('email', user.email)
      .single()

    if (existingApplication) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-black via-background to-zinc-950 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-black/80 backdrop-blur-sm border border-border/30 rounded-xl p-8 shadow-2xl">
            <div className="text-center space-y-4">
              <div className="flex justify-center mb-6">
                <div
                  className="bg-gradient-to-br from-slate-300 via-zinc-200 to-slate-400 p-3.5 rounded-lg shadow-md flex items-center justify-center border border-slate-300/50"
                  style={{
                    background: "linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 25%, #94a3b8 50%, #64748b 75%, #475569 100%)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(0,0,0,0.2), 0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)",
                  }}
                >
                  <span className="text-4xl font-black leading-none bg-clip-text text-transparent bg-gradient-to-r from-zinc-700 via-zinc-500 to-zinc-800 tracking-tighter drop-shadow-sm">
                    ICU
                  </span>
                </div>
              </div>
              
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                Application Status
              </h1>
              
              <div className={`p-4 rounded-lg border ${
                existingApplication.status === 'approved' 
                  ? 'bg-green-500/10 border-green-500/30 text-green-400'
                  : existingApplication.status === 'rejected'
                  ? 'bg-red-500/10 border-red-500/30 text-red-400'
                  : existingApplication.status === 'under_review'
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                  : existingApplication.status === 'waitlisted'
                  ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
                  : 'bg-gray-500/10 border-gray-500/30 text-gray-400'
              }`}>
                <p className="font-semibold mb-2">
                  Status: {existingApplication.status.charAt(0).toUpperCase() + existingApplication.status.slice(1).replace('_', ' ')}
                </p>
                <p className="text-sm opacity-90">
                  {existingApplication.status === 'pending' && "Your application is being reviewed. We'll notify you of our decision soon."}
                  {existingApplication.status === 'under_review' && "Your application is currently under detailed review."}
                  {existingApplication.status === 'approved' && "Congratulations! Your application has been approved. Check your email for next steps."}
                  {existingApplication.status === 'rejected' && "Thank you for your interest. Unfortunately, we're unable to offer you membership at this time."}
                  {existingApplication.status === 'waitlisted' && "You're on our waitlist. We'll contact you when a spot becomes available."}
                </p>
                {existingApplication.review_notes && (
                  <div className="mt-3 p-3 bg-black/30 rounded border border-border/50">
                    <p className="text-sm font-medium mb-1">Review Notes:</p>
                    <p className="text-sm opacity-90">{existingApplication.review_notes}</p>
                  </div>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground">
                Applied: {new Date(existingApplication.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-background to-zinc-950">
      <ApplicationForm />
    </div>
  )
}
