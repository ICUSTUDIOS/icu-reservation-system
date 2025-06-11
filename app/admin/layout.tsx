import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  // Check if user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    redirect('/auth/login')
  }

  // Check if user is admin
  const { data: member, error: memberError } = await supabase
    .from('members')
    .select('role')
    .eq('auth_id', user.id)
    .single()

  if (memberError || !member || !['admin', 'super_admin'].includes(member.role)) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  )
}
