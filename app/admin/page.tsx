import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import ProfessionalAdminDashboard from "@/components/admin/professional-admin-dashboard"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin Panel | ICU Creative Studio",
  description: "Professional administrative dashboard for ICU Creative Studio management.",
}

export default async function AdminPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is admin
  const { data: member } = await supabase
    .from('members')
    .select('role')
    .eq('auth_id', user.id)
    .single()
  if (!member || !['admin', 'super_admin'].includes(member.role)) {
    redirect("/dashboard")
  }

  return <ProfessionalAdminDashboard userRole={member.role} />
}
