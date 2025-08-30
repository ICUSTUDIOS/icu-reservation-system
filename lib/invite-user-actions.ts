"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { revalidatePath } from "next/cache"

interface InviteUserData {
  email: string
  role: 'member' | 'admin'
  defaultPoints: number
}

export async function inviteUser(userData: InviteUserData) {
  const supabase = await createClient()

  try {
    // Get current user to verify admin privileges
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return { error: "You must be logged in to invite users" }
    }

    // Check if current user is admin
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('role')
      .eq('auth_id', user.id)
      .single()

    if (memberError || !member || member.role !== 'admin') {
      return { error: "You must be an admin to invite users" }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(userData.email)) {
      return { error: "Please enter a valid email address" }
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('members')
      .select('email')
      .eq('email', userData.email)
      .single()

    if (existingUser) {
      return { error: "A user with this email already exists" }
    }

    // Create admin client for invitation
    let adminSupabase
    try {
      adminSupabase = createAdminClient()
    } catch (adminError) {
      console.error('Admin client creation failed:', adminError)
      return { error: "Admin operations not configured. Please contact system administrator." }
    }

    // Create the user invitation using the admin client
    const { data, error } = await adminSupabase.auth.admin.inviteUserByEmail(userData.email, {
      data: {
        role: userData.role,
        default_points: userData.defaultPoints,
        invited_by_admin: true
      }
    })

    if (error) {
      console.error('Invitation error:', error)
      return { error: `Failed to send invitation: ${error.message}` }
    }    // If invitation was sent successfully, we don't create a member record yet
    // The member record will be created when they accept the invitation via the auth trigger
    // We'll store the invitation metadata separately or check pending invites via auth.admin.listUsers
    
    console.log('Invitation sent successfully to:', userData.email)
    console.log('User will be created with role:', userData.role, 'and points:', userData.defaultPoints)

    // Revalidate the admin page to refresh data
    revalidatePath('/admin')
    
    return { 
      success: true, 
      message: `Invitation sent successfully to ${userData.email}` 
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { error: "Failed to send invitation. Please try again." }
  }
}

export async function getPendingInvitations() {
  const supabase = await createClient()

  try {
    // Get current user to verify admin privileges
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return { error: "You must be logged in to view invitations" }
    }

    // Check if current user is admin
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('role')
      .eq('auth_id', user.id)
      .single()

    if (memberError || !member || member.role !== 'admin') {
      return { error: "You must be an admin to view invitations" }
    }

    // Create admin client for fetching auth users
    let adminSupabase
    try {
      adminSupabase = createAdminClient()
    } catch (adminError) {
      console.error('Admin client creation failed:', adminError)
      return { error: "Admin operations not configured. Please contact system administrator." }
    }

    // Get all users from auth
    const { data: authUsers, error: authError } = await adminSupabase.auth.admin.listUsers()

    if (authError) {
      console.error('Error fetching auth users:', authError)
      return { error: "Failed to fetch invitations" }
    }// Filter for invited users (those with email_confirmed_at = null and invited_at != null)
    const pendingInvitations = authUsers.users.filter((user: any) => 
      user.invited_at && !user.email_confirmed_at
    ).map((user: any) => ({
      id: user.id,
      email: user.email,
      invited_at: user.invited_at,
      role: user.user_metadata?.role || 'member',
      default_points: user.user_metadata?.default_points || 40
    }))

    return { data: pendingInvitations }

  } catch (error) {
    console.error('Unexpected error:', error)
    return { error: "Failed to fetch invitations. Please try again." }
  }
}

export async function revokeInvitation(userId: string) {
  const supabase = await createClient()

  try {
    // Get current user to verify admin privileges
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return { error: "You must be logged in to revoke invitations" }
    }

    // Check if current user is admin
    const { data: member, error: memberError } = await supabase
      .from('members')
      .select('role')
      .eq('auth_id', user.id)
      .single()

    if (memberError || !member || member.role !== 'admin') {
      return { error: "You must be an admin to revoke invitations" }
    }

    // Create admin client for user deletion
    let adminSupabase
    try {
      adminSupabase = createAdminClient()
    } catch (adminError) {
      console.error('Admin client creation failed:', adminError)
      return { error: "Admin operations not configured. Please contact system administrator." }
    }

    // Delete the user from auth (this revokes the invitation)
    const { error: deleteError } = await adminSupabase.auth.admin.deleteUser(userId)

    if (deleteError) {
      console.error('Error revoking invitation:', deleteError)
      return { error: `Failed to revoke invitation: ${deleteError.message}` }
    }

    // Revalidate the admin page to refresh data
    revalidatePath('/admin')
    
    return { 
      success: true, 
      message: "Invitation revoked successfully" 
    }

  } catch (error) {
    console.error('Unexpected error:', error)
    return { error: "Failed to revoke invitation. Please try again." }
  }
}
