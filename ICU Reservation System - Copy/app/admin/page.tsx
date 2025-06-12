import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import AdminDashboard from "@/components/admin/admin-dashboard"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Admin Panel | ICU Creative Studio 1",
  description: "Administrative dashboard for ICU Creative Studio 1 management.",
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

  return <AdminDashboard userRole={member.role} />
}
