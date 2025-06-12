"use client"

import { useState, useEffect } from "react"
import { supabase } from '@/lib/supabase/client'
import { Shield, Users, FileText, Loader2, UserCheck, Clock, CheckCircle, XCircle, AlertCircle, Mail, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import AdminInviteUser from "./admin-invite-user"

interface Application {
  id: number
  email: string
  full_name: string
  city: string
  status: string
  studio_usage_purpose: string
  why_join_studio: string
  created_at: string
  reviewed_at: string | null
  review_notes: string | null
}

export default function FixedAdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [applicationsLoading, setApplicationsLoading] = useState(false)
  const [stats, setStats] = useState({
    totalUsers: 0,    totalBookings: 0,
    totalReports: 0,
    totalApplications: 0,
    pendingApplications: 0
  })
  const [applications, setApplications] = useState<Application[]>([])
  const [selectedTab, setSelectedTab] = useState<'overview' | 'applications' | 'users'>('overview')

  useEffect(() => {
    loadData()
  }, [])
  const loadData = async () => {
    try {
      // Get basic stats
      const [usersResult, bookingsResult, reportsResult, applicationsResult, pendingApplicationsResult] = await Promise.all([
        supabase.from('members').select('id', { count: 'exact' }),
        supabase.from('bookings').select('id', { count: 'exact' }),
        supabase.from('reports').select('id', { count: 'exact' }),
        supabase.from('applications').select('id', { count: 'exact' }),
        supabase.from('applications').select('id', { count: 'exact' }).eq('status', 'pending')
      ])

      setStats({
        totalUsers: usersResult.count || 0,
        totalBookings: bookingsResult.count || 0,
        totalReports: reportsResult.count || 0,
        totalApplications: applicationsResult.count || 0,
        pendingApplications: pendingApplicationsResult.count || 0
      })
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadApplications = async () => {
    setApplicationsLoading(true)
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('id, email, full_name, city, status, studio_usage_purpose, why_join_studio, created_at, reviewed_at, review_notes')
        .order('created_at', { ascending: false })

      if (error) throw error
      setApplications(data || [])
    } catch (error) {
      console.error('Error loading applications:', error)
      toast.error('Failed to load applications')
    } finally {
      setApplicationsLoading(false)
    }
  }

  const updateApplicationStatus = async (applicationId: number, status: string, notes?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('applications')
        .update({
          status,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          review_notes: notes || null
        })
        .eq('id', applicationId)

      if (error) throw error

      toast.success(`Application ${status} successfully`)
      loadApplications()
      loadData() // Refresh stats
    } catch (error) {
      console.error('Error updating application:', error)
      toast.error('Failed to update application')
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'default'
      case 'under_review': return 'secondary'
      case 'approved': return 'default'
      case 'rejected': return 'destructive'
      case 'waitlisted': return 'outline'
      default: return 'default'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />
      case 'under_review': return <AlertCircle className="h-4 w-4" />
      case 'approved': return <CheckCircle className="h-4 w-4" />
      case 'rejected': return <XCircle className="h-4 w-4" />
      case 'waitlisted': return <UserCheck className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-background to-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-400 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-background to-zinc-950 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-amber-400" />
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8">
          <Button
            variant={selectedTab === 'overview' ? 'default' : 'outline'}
            onClick={() => setSelectedTab('overview')}
            className={selectedTab === 'overview' ? 'bg-amber-600 hover:bg-amber-700' : 'border-amber-600/30 text-amber-400 hover:bg-amber-600/10'}
          >
            Overview
          </Button>          <Button
            variant={selectedTab === 'applications' ? 'default' : 'outline'}
            onClick={() => {
              setSelectedTab('applications')
              if (applications.length === 0) loadApplications()
            }}
            className={selectedTab === 'applications' ? 'bg-amber-600 hover:bg-amber-700' : 'border-amber-600/30 text-amber-400 hover:bg-amber-600/10'}
          >
            Applications {stats.pendingApplications > 0 && <Badge className="ml-2 bg-red-500 text-white">{stats.pendingApplications}</Badge>}
          </Button>
          <Button
            variant={selectedTab === 'users' ? 'default' : 'outline'}
            onClick={() => setSelectedTab('users')}
            className={selectedTab === 'users' ? 'bg-amber-600 hover:bg-amber-700' : 'border-amber-600/30 text-amber-400 hover:bg-amber-600/10'}
          >
            <Users className="h-4 w-4 mr-2" />
            Users
          </Button>
        </div>

        {selectedTab === 'overview' && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <div className="flex items-center gap-3">
                  <Users className="h-8 w-8 text-blue-400" />
                  <div>
                    <p className="text-sm text-gray-400">Total Users</p>
                    <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-green-400" />
                  <div>
                    <p className="text-sm text-gray-400">Total Bookings</p>
                    <p className="text-3xl font-bold text-white">{stats.totalBookings}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <div className="flex items-center gap-3">
                  <Shield className="h-8 w-8 text-red-400" />
                  <div>
                    <p className="text-sm text-gray-400">Reports</p>
                    <p className="text-3xl font-bold text-white">{stats.totalReports}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <div className="flex items-center gap-3">
                  <UserCheck className="h-8 w-8 text-purple-400" />
                  <div>
                    <p className="text-sm text-gray-400">Applications</p>
                    <p className="text-3xl font-bold text-white">{stats.totalApplications}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-yellow-400" />
                  <div>
                    <p className="text-sm text-gray-400">Pending</p>
                    <p className="text-3xl font-bold text-white">{stats.pendingApplications}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Card */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">System Status</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Database Connection</span>
                  <span className="text-green-400 font-medium">✓ Connected</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Authentication</span>
                  <span className="text-green-400 font-medium">✓ Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Admin Access</span>
                  <span className="text-green-400 font-medium">✓ Granted</span>
                </div>
              </div>
            </div>
          </>
        )}

        {selectedTab === 'applications' && (
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">Applications Management</h2>
              <Button
                onClick={loadApplications}
                disabled={applicationsLoading}
                variant="outline"
                className="border-amber-600/30 text-amber-400 hover:bg-amber-600/10"
              >
                {applicationsLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Refresh'
                )}
              </Button>
            </div>

            {applicationsLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-amber-400 mx-auto mb-4" />
                <p className="text-muted-foreground">Loading applications...</p>
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-8">
                <UserCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">No applications found</p>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((application) => (
                  <div key={application.id} className="bg-black/30 border border-white/10 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{application.full_name}</h3>
                        <p className="text-gray-400 text-sm">{application.email} • {application.city}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={getStatusBadgeVariant(application.status)}
                          className="flex items-center gap-1"
                        >
                          {getStatusIcon(application.status)}
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1).replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Studio Usage Purpose</h4>
                        <p className="text-sm text-gray-400">{application.studio_usage_purpose}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Why Join Studio</h4>
                        <p className="text-sm text-gray-400">{application.why_join_studio}</p>
                      </div>
                    </div>

                    {application.review_notes && (
                      <div className="mb-4">
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Review Notes</h4>
                        <p className="text-sm text-gray-400 bg-black/20 p-2 rounded">{application.review_notes}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        Applied: {new Date(application.created_at).toLocaleDateString()}
                        {application.reviewed_at && (
                          <span> • Reviewed: {new Date(application.reviewed_at).toLocaleDateString()}</span>
                        )}
                      </div>

                      {application.status === 'pending' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => updateApplicationStatus(application.id, 'under_review')}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            Review
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => updateApplicationStatus(application.id, 'approved')}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => updateApplicationStatus(application.id, 'rejected')}
                            variant="destructive"
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                      
                      {application.status === 'under_review' && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => updateApplicationStatus(application.id, 'approved')}
                            className="bg-green-600 hover:bg-green-700 text-white"
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => updateApplicationStatus(application.id, 'waitlisted')}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white"
                          >
                            Waitlist
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => updateApplicationStatus(application.id, 'rejected')}
                            variant="destructive"
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )            )}
          </div>
        )}

        {/* {selectedTab === 'users' && ( */}
        {(selectedTab as string) === 'users' && (
          <div className="bg-white/5 border border-white/10 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="h-6 w-6 text-blue-400" />
                User Management
              </h2>
              <AdminInviteUser />
            </div>
            
            <div className="text-gray-300">
              <p className="mb-4">Manage users and send invitations to new members.</p>
              
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Invite New User</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Click the "Invite New User" button above to send an invitation email to a new user. 
                  You can set their default role (Member or Admin) and starting points balance.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Mail className="h-4 w-4 text-blue-400" />
                      <span className="font-medium text-blue-400">Email Invitation</span>
                    </div>
                    <p className="text-gray-300">User receives Supabase invitation email</p>
                  </div>
                  
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <UserCheck className="h-4 w-4 text-green-400" />
                      <span className="font-medium text-green-400">Default Role</span>
                    </div>
                    <p className="text-gray-300">Set as Member or Admin</p>
                  </div>
                  
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-purple-400" />
                      <span className="font-medium text-purple-400">Starting Points</span>
                    </div>
                    <p className="text-gray-300">Configure initial points balance</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
        )}
      </div>
    </div>
  )
}
