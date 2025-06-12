"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  FileText, 
  AlertTriangle, 
  Calendar,
  Settings,
  BarChart3,
  Plus,
  Edit,
  Check,
  X,
  Search,
  Filter,
  Download,
  Eye,
  UserPlus,
  Coins,
  Clock,
  Shield,
  Home,
  LogOut
} from "lucide-react"
import { toast } from "sonner"
import { supabase } from "@/lib/supabase/client"
import Link from "next/link"

interface AdminDashboardProps {
  userRole: string
}

interface DashboardStats {
  totalMembers: number
  pendingApplications: number
  pendingReports: number
  activeBookingsToday: number
  totalPointsAllocated?: number
  totalPointsCapacity?: number
  weekendSlotsUsedThisWeek?: number
}

interface Member {
  id: string
  auth_id: string
  email: string
  monthly_points: number
  monthly_points_max: number
  weekend_slots_used: number
  weekend_slots_max: number
  role: string
  created_at: string
  updated_at: string
}

interface Application {
  id: number
  email: string
  full_name: string
  age: number
  city: string
  status: string
  studio_usage_purpose: string
  about_yourself: string
  why_join_studio: string
  created_at: string
  reviewed_at: string | null
  review_notes: string | null
}

interface Report {
  id: string
  subject: string
  description: string
  status: string
  priority: string
  report_type: string
  created_at: string
  member_id: string
  admin_notes: string | null
}

export default function AdminDashboard({ userRole }: AdminDashboardProps) {  const [activeTab, setActiveTab] = useState("dashboard")
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    pendingApplications: 0,
    pendingReports: 0,
    activeBookingsToday: 0,
    totalPointsAllocated: 0,
    totalPointsCapacity: 0,
    weekendSlotsUsedThisWeek: 0
  })
  const [members, setMembers] = useState<Member[]>([])
  const [applications, setApplications] = useState<Application[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [showBulkActions, setShowBulkActions] = useState(false)

  useEffect(() => {
    loadDashboardData()
  }, [])
  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Try to load stats using the new function first
      try {
        const { data: statsData, error: statsError } = await supabase.rpc('get_admin_dashboard_stats')
        
        if (statsError) throw statsError
        
        if (statsData) {
          setStats({
            totalMembers: statsData.total_members,
            pendingApplications: statsData.pending_applications,
            pendingReports: statsData.pending_reports,
            activeBookingsToday: statsData.active_bookings_today,
            totalPointsAllocated: statsData.total_points_allocated,
            totalPointsCapacity: statsData.total_points_capacity,
            weekendSlotsUsedThisWeek: statsData.weekend_slots_used_this_week
          })
        }
      } catch (statsError) {
        console.log('Using fallback stats loading:', statsError)
        // Fallback to individual queries
        const [membersRes, applicationsRes, reportsRes, bookingsRes] = await Promise.all([
          supabase.from('members').select('*', { count: 'exact' }),
          supabase.from('applications').select('*', { count: 'exact' }).eq('status', 'pending'),
          supabase.from('reports').select('*', { count: 'exact' }).eq('status', 'pending'),
          supabase
            .from('bookings')
            .select('*', { count: 'exact' })
            .eq('status', 'confirmed')
            .gte('start_time', new Date().toISOString().split('T')[0])
            .lt('start_time', new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        ])

        setStats({
          totalMembers: membersRes.count || 0,
          pendingApplications: applicationsRes.count || 0,
          pendingReports: reportsRes.count || 0,
          activeBookingsToday: bookingsRes.count || 0
        })
      }

      // Load detailed data for management
      const [membersDetailRes, applicationsDetailRes, reportsDetailRes] = await Promise.all([
        supabase.from('members').select('*').order('created_at', { ascending: false }),
        supabase.from('applications').select('*').order('created_at', { ascending: false }),
        supabase.from('reports').select('*').order('created_at', { ascending: false })
      ])

      setMembers(membersDetailRes.data || [])
      setApplications(applicationsDetailRes.data || [])
      setReports(reportsDetailRes.data || [])

    } catch (error) {
      console.error('Error loading dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }
  const updateMemberPoints = async (memberId: string, points: number) => {
    try {
      const { error } = await supabase
        .from('members')
        .update({ monthly_points: points })
        .eq('id', memberId)

      if (error) throw error

      // Log admin action
      await logAdminAction('points_adjustment', 'user', memberId, `Adjusted points to ${points}`)

      toast.success('Points updated successfully')
      loadDashboardData()
    } catch (error) {
      console.error('Error updating points:', error)
      toast.error('Failed to update points')
    }
  }

  const updateMemberPointsCap = async (memberId: string, pointsCap: number) => {
    try {
      const { error } = await supabase
        .from('members')
        .update({ monthly_points_max: pointsCap })
        .eq('id', memberId)

      if (error) throw error

      // Log admin action
      await logAdminAction('points_adjustment', 'user', memberId, `Updated points cap to ${pointsCap}`)

      toast.success('Points cap updated successfully')
      loadDashboardData()
    } catch (error) {
      console.error('Error updating points cap:', error)
      toast.error('Failed to update points cap')
    }
  }
  const updateMemberWeekendSlots = async (memberId: string, slotsMax: number) => {
    try {
      const { error } = await supabase
        .from('members')
        .update({ weekend_slots_max: slotsMax })
        .eq('id', memberId)

      if (error) throw error

      // Log admin action
      await logAdminAction('user_update', 'user', memberId, `Updated weekend slots limit to ${slotsMax}`)

      toast.success('Weekend slots limit updated successfully')
      loadDashboardData()
    } catch (error) {
      console.error('Error updating weekend slots limit:', error)
      toast.error('Failed to update weekend slots limit')
    }
  }

  const bulkResetMonthlyPoints = async () => {
    if (!confirm('Are you sure you want to reset all users\' monthly points to their maximum allocation? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase.rpc('bulk_reset_monthly_points')

      if (error) throw error

      // Log admin action
      await logAdminAction('points_adjustment', 'system', 'bulk_reset', 'Reset all users monthly points to maximum')

      toast.success('All monthly points reset successfully')
      loadDashboardData()
    } catch (error) {
      console.error('Error resetting monthly points:', error)      // Fallback to individual updates if RPC doesn't exist
      try {
        const { data: membersData, error: fetchError } = await supabase
          .from('members')
          .select('id, monthly_points_max')

        if (fetchError) throw fetchError

        // Update each member individually
        const updatePromises = membersData.map(member => 
          supabase
            .from('members')
            .update({ monthly_points: member.monthly_points_max })
            .eq('id', member.id)
        )

        await Promise.all(updatePromises)

        await logAdminAction('points_adjustment', 'system', 'bulk_reset', 'Reset all users monthly points to maximum (fallback)')
        toast.success('All monthly points reset successfully')
        loadDashboardData()
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError)
        toast.error('Failed to reset monthly points')
      }
    }
  }

  const bulkResetWeekendSlots = async () => {
    if (!confirm('Are you sure you want to reset all users\' weekend slots used to 0? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('members')
        .update({ weekend_slots_used: 0 })

      if (error) throw error

      // Log admin action
      await logAdminAction('user_update', 'system', 'bulk_reset', 'Reset all users weekend slots used to 0')

      toast.success('All weekend slots reset successfully')
      loadDashboardData()
    } catch (error) {
      console.error('Error resetting weekend slots:', error)
      toast.error('Failed to reset weekend slots')
    }
  }

  const bulkUpdatePointsCap = async (newCap: number) => {
    if (!confirm(`Are you sure you want to set all users' monthly points cap to ${newCap}? This action cannot be undone.`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('members')
        .update({ monthly_points_max: newCap })

      if (error) throw error

      // Log admin action
      await logAdminAction('points_adjustment', 'system', 'bulk_update', `Updated all users monthly points cap to ${newCap}`)

      toast.success(`All monthly points caps updated to ${newCap} successfully`)
      loadDashboardData()
    } catch (error) {
      console.error('Error updating points caps:', error)
      toast.error('Failed to update points caps')
    }
  }

  const updateMemberRole = async (memberId: string, role: string) => {
    try {
      const { error } = await supabase
        .from('members')
        .update({ role })
        .eq('id', memberId)

      if (error) throw error

      // Log admin action
      await logAdminAction('user_update', 'user', memberId, `Changed role to ${role}`)

      toast.success('Role updated successfully')
      loadDashboardData()
    } catch (error) {
      console.error('Error updating role:', error)
      toast.error('Failed to update role')
    }
  }

  const reviewApplication = async (applicationId: number, status: string, notes: string = '') => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ 
          status, 
          review_notes: notes,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', applicationId)

      if (error) throw error

      // Log admin action
      await logAdminAction('application_review', 'application', applicationId.toString(), `Application ${status}: ${notes}`)

      toast.success(`Application ${status} successfully`)
      loadDashboardData()
      setSelectedApplication(null)
    } catch (error) {
      console.error('Error reviewing application:', error)
      toast.error('Failed to review application')
    }
  }

  const updateReportStatus = async (reportId: string, status: string, adminNotes: string = '') => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({ 
          status,
          admin_notes: adminNotes,
          resolved_at: status === 'resolved' ? new Date().toISOString() : null
        })
        .eq('id', reportId)

      if (error) throw error

      // Log admin action
      await logAdminAction('report_update', 'report', reportId, `Report status changed to ${status}: ${adminNotes}`)

      toast.success('Report updated successfully')
      loadDashboardData()
      setSelectedReport(null)
    } catch (error) {
      console.error('Error updating report:', error)
      toast.error('Failed to update report')
    }
  }

  const logAdminAction = async (actionType: string, targetType: string, targetId: string, description: string) => {
    try {
      await supabase
        .from('admin_actions')
        .insert({
          action_type: actionType,
          target_type: targetType,
          target_id: targetId,
          action_description: description
        })
    } catch (error) {
      console.error('Error logging admin action:', error)
    }
  }

  const filteredMembers = members.filter(member =>
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredApplications = applications.filter(app =>
    app.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.status.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredReports = reports.filter(report =>
    report.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.report_type.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-background to-zinc-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-background to-zinc-950 text-foreground">
      {/* Header */}
      <header className="border-b border-border/30 backdrop-blur-md sticky top-0 z-50 bg-black/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div
                  className="bg-gradient-to-br from-slate-300 via-zinc-200 to-slate-400 p-2 rounded-lg shadow-md flex items-center justify-center border border-slate-300/50"
                  style={{
                    background: "linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 25%, #94a3b8 50%, #64748b 75%, #475569 100%)",
                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.4), inset 0 -1px 0 rgba(0,0,0,0.2)"
                  }}
                >
                  <span className="text-lg font-black leading-none bg-clip-text text-transparent bg-gradient-to-r from-zinc-700 via-zinc-500 to-zinc-800">
                    ICU
                  </span>
                </div>
                <h1 className="text-xl font-bold">Admin Panel</h1>
              </div>
              <Badge variant="outline" className="text-xs">
                {userRole.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button variant="outline" size="sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Navigation Tabs */}
        <div className="mb-6">
          <nav className="flex space-x-1 bg-muted/20 p-1 rounded-lg">
            {[
              { id: 'dashboard', label: 'Overview', icon: BarChart3 },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'applications', label: 'Applications', icon: FileText },
              { id: 'reports', label: 'Reports', icon: AlertTriangle },
              { id: 'bookings', label: 'Bookings', icon: Calendar },
              { id: 'settings', label: 'Settings', icon: Settings }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                  {tab.id === 'applications' && stats.pendingApplications > 0 && (
                    <Badge variant="destructive" className="ml-1 text-xs">
                      {stats.pendingApplications}
                    </Badge>
                  )}
                  {tab.id === 'reports' && stats.pendingReports > 0 && (
                    <Badge variant="destructive" className="ml-1 text-xs">
                      {stats.pendingReports}
                    </Badge>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Dashboard Overview */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Members</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalMembers}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingApplications}</div>
                  {stats.pendingApplications > 0 && (
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="p-0 h-auto"
                      onClick={() => setActiveTab('applications')}
                    >
                      Review now
                    </Button>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.pendingReports}</div>
                  {stats.pendingReports > 0 && (
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="p-0 h-auto"
                      onClick={() => setActiveTab('reports')}
                    >
                      Review now
                    </Button>
                  )}
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Bookings Today</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeBookingsToday}</div>
                </CardContent>
              </Card>
            </div>

            {/* Enhanced Stats Cards */}
            {(stats.totalPointsAllocated !== undefined) && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Points Utilization</CardTitle>
                    <Coins className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>                    <div className="text-2xl font-bold">
                      {stats.totalPointsAllocated || 0}/{stats.totalPointsCapacity || 0}
                    </div><p className="text-xs text-muted-foreground">
                      {(stats.totalPointsCapacity && stats.totalPointsAllocated && stats.totalPointsCapacity > 0) ? 
                        Math.round((stats.totalPointsAllocated / stats.totalPointsCapacity) * 100) : 0
                      }% of total capacity used
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Weekend Slots This Week</CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.weekendSlotsUsedThisWeek || 0}</div>
                    <p className="text-xs text-muted-foreground">
                      Slots used across all members
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">System Health</CardTitle>
                    <Shield className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-500">Healthy</div>
                    <p className="text-xs text-muted-foreground">
                      All systems operational
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest system activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {applications.slice(0, 3).map((app) => (
                    <div key={app.id} className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm">New application from {app.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(app.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {reports.slice(0, 2).map((report) => (
                    <div key={report.id} className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm">New report: {report.subject}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(report.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}        {/* User Management */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">User Management</h2>
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBulkActions(!showBulkActions)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Bulk Actions
                </Button>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </div>

            {/* Bulk Actions Panel */}
            {showBulkActions && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Bulk Management Actions</CardTitle>
                  <CardDescription>Perform actions on all users or specific groups</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-2">Monthly Points Reset</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Reset all users' monthly points to their maximum allocation
                        </p>
                        <Button
                          size="sm"
                          onClick={() => bulkResetMonthlyPoints()}
                          className="w-full"
                        >
                          Reset All Points
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-2">Weekend Slots Reset</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Reset all users' weekend slots used to 0
                        </p>
                        <Button
                          size="sm"
                          onClick={() => bulkResetWeekendSlots()}
                          className="w-full"
                        >
                          Reset Weekend Slots
                        </Button>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-2">Global Points Cap</h4>
                        <div className="space-y-2">
                          <Input
                            type="number"
                            placeholder="New cap (e.g., 60)"
                            min="1"
                            max="200"
                            id="globalPointsCap"
                          />
                          <Button
                            size="sm"
                            onClick={() => {
                              const input = document.getElementById('globalPointsCap') as HTMLInputElement
                              const newCap = parseInt(input.value)
                              if (newCap && newCap > 0) {
                                bulkUpdatePointsCap(newCap)
                              }
                            }}
                            className="w-full"
                          >
                            Update All Caps
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            )}            <div className="grid gap-6">
              {filteredMembers.map((member) => (
                <Card key={member.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold">{member.email}</h3>
                          <Badge variant={member.role === 'admin' || member.role === 'super_admin' ? 'default' : 'secondary'}>
                            {member.role}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Coins className="h-4 w-4" />
                            <span className="font-medium">
                              {member.monthly_points}/{member.monthly_points_max} points
                            </span>
                            {member.monthly_points_max !== 40 && (
                              <Badge variant="outline" className="text-xs">
                                Custom Cap
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{member.weekend_slots_used}/{member.weekend_slots_max} weekend slots</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>Joined {new Date(member.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        {/* Points utilization bar */}
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all duration-300"
                              style={{ 
                                width: `${(member.monthly_points / member.monthly_points_max) * 100}%` 
                              }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground min-w-[3rem]">
                            {Math.round((member.monthly_points / member.monthly_points_max) * 100)}%
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedMember(member)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Manage
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* User Management Modal */}
            {selectedMember && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <Card className="w-full max-w-md">
                  <CardHeader>
                    <CardTitle>Manage User: {selectedMember.email}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">                    <div>
                      <Label>Monthly Points</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Input
                          type="number"
                          value={selectedMember.monthly_points}
                          onChange={(e) => setSelectedMember({
                            ...selectedMember,
                            monthly_points: parseInt(e.target.value) || 0
                          })}
                          min="0"
                          max={selectedMember.monthly_points_max}
                        />
                        <Button
                          size="sm"
                          onClick={() => updateMemberPoints(selectedMember.id, selectedMember.monthly_points)}
                        >
                          Update
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Current: {selectedMember.monthly_points} / Max: {selectedMember.monthly_points_max}
                      </p>
                    </div>

                    <div>
                      <Label>Monthly Points Cap</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Input
                          type="number"
                          value={selectedMember.monthly_points_max}
                          onChange={(e) => setSelectedMember({
                            ...selectedMember,
                            monthly_points_max: parseInt(e.target.value) || 40
                          })}
                          min="1"
                          max="200"
                        />
                        <Button
                          size="sm"
                          onClick={() => updateMemberPointsCap(selectedMember.id, selectedMember.monthly_points_max)}
                        >
                          Update Cap
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Set the maximum points this member can have (default: 40)
                      </p>
                    </div>

                    <div>
                      <Label>Weekend Slots Limit</Label>
                      <div className="flex items-center space-x-2 mt-1">
                        <Input
                          type="number"
                          value={selectedMember.weekend_slots_max}
                          onChange={(e) => setSelectedMember({
                            ...selectedMember,
                            weekend_slots_max: parseInt(e.target.value) || 12
                          })}
                          min="1"
                          max="24"
                        />
                        <Button
                          size="sm"
                          onClick={() => updateMemberWeekendSlots(selectedMember.id, selectedMember.weekend_slots_max)}
                        >
                          Update Limit
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        Weekly weekend slots limit (current used: {selectedMember.weekend_slots_used})
                      </p>
                    </div>

                    <div>
                      <Label>Role</Label>
                      <Select
                        value={selectedMember.role}
                        onValueChange={(value) => setSelectedMember({
                          ...selectedMember,
                          role: value
                        })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          {userRole === 'super_admin' && (
                            <SelectItem value="super_admin">Super Admin</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      {selectedMember.role !== members.find(m => m.id === selectedMember.id)?.role && (
                        <Button
                          size="sm"
                          onClick={() => updateMemberRole(selectedMember.id, selectedMember.role)}
                          className="mt-2"
                        >
                          Update Role
                        </Button>
                      )}
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        variant="outline"
                        onClick={() => setSelectedMember(null)}
                      >
                        Close
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* Applications Management */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Applications Management</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search applications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-6">
              {filteredApplications.map((application) => (
                <Card key={application.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold">{application.full_name}</h3>
                          <Badge variant={
                            application.status === 'approved' ? 'default' :
                            application.status === 'rejected' ? 'destructive' :
                            application.status === 'pending' ? 'secondary' : 'outline'
                          }>
                            {application.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>{application.email} • {application.city} • Age {application.age}</p>
                          <p>Applied: {new Date(application.created_at).toLocaleDateString()}</p>
                          <p className="truncate max-w-md">{application.studio_usage_purpose}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedApplication(application)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Review
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Application Review Modal */}
            {selectedApplication && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
                <Card className="w-full max-w-2xl m-4">
                  <CardHeader>
                    <CardTitle>Application Review: {selectedApplication.full_name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 max-h-96 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Email</Label>
                        <p className="text-sm">{selectedApplication.email}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Age</Label>
                        <p className="text-sm">{selectedApplication.age}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">City</Label>
                        <p className="text-sm">{selectedApplication.city}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Status</Label>
                        <Badge variant={
                          selectedApplication.status === 'approved' ? 'default' :
                          selectedApplication.status === 'rejected' ? 'destructive' :
                          'secondary'
                        }>
                          {selectedApplication.status}
                        </Badge>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Studio Usage Purpose</Label>
                      <p className="text-sm mt-1">{selectedApplication.studio_usage_purpose}</p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">About Yourself</Label>
                      <p className="text-sm mt-1">{selectedApplication.about_yourself}</p>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Why Join Studio</Label>
                      <p className="text-sm mt-1">{selectedApplication.why_join_studio}</p>
                    </div>

                    {selectedApplication.review_notes && (
                      <div>
                        <Label className="text-sm font-medium">Review Notes</Label>
                        <p className="text-sm mt-1">{selectedApplication.review_notes}</p>
                      </div>
                    )}

                    {selectedApplication.status === 'pending' && (
                      <div className="space-y-4 pt-4 border-t">
                        <div>
                          <Label>Review Notes</Label>
                          <Textarea
                            placeholder="Add review notes..."
                            rows={3}
                            id="reviewNotes"
                          />
                        </div>
                        
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            onClick={() => setSelectedApplication(null)}
                          >
                            Close
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={() => {
                              const notes = (document.getElementById('reviewNotes') as HTMLTextAreaElement)?.value || ''
                              reviewApplication(selectedApplication.id, 'rejected', notes)
                            }}
                          >
                            <X className="h-4 w-4 mr-2" />
                            Reject
                          </Button>
                          <Button
                            onClick={() => {
                              const notes = (document.getElementById('reviewNotes') as HTMLTextAreaElement)?.value || ''
                              reviewApplication(selectedApplication.id, 'approved', notes)
                            }}
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Approve
                          </Button>
                        </div>
                      </div>
                    )}

                    {selectedApplication.status !== 'pending' && (
                      <div className="flex justify-end">
                        <Button
                          variant="outline"
                          onClick={() => setSelectedApplication(null)}
                        >
                          Close
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* Reports Management */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Reports Management</h2>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search reports..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-6">
              {filteredReports.map((report) => (
                <Card key={report.id}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold">{report.subject}</h3>
                          <Badge variant={
                            report.status === 'resolved' ? 'default' :
                            report.status === 'in_progress' ? 'secondary' :
                            'destructive'
                          }>
                            {report.status.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline">
                            {report.priority}
                          </Badge>
                          <Badge variant="outline">
                            {report.report_type}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p className="truncate max-w-md">{report.description}</p>
                          <p>Reported: {new Date(report.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedReport(report)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Manage
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Report Management Modal */}
            {selectedReport && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <Card className="w-full max-w-2xl">
                  <CardHeader>
                    <CardTitle>Manage Report: {selectedReport.subject}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Status</Label>
                        <p className="text-sm">{selectedReport.status.replace('_', ' ')}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Priority</Label>
                        <p className="text-sm">{selectedReport.priority}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Type</Label>
                        <p className="text-sm">{selectedReport.report_type}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Created</Label>
                        <p className="text-sm">{new Date(selectedReport.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Description</Label>
                      <p className="text-sm mt-1">{selectedReport.description}</p>
                    </div>

                    {selectedReport.admin_notes && (
                      <div>
                        <Label className="text-sm font-medium">Admin Notes</Label>
                        <p className="text-sm mt-1">{selectedReport.admin_notes}</p>
                      </div>
                    )}

                    <div className="space-y-4 pt-4 border-t">
                      <div>
                        <Label>Update Status</Label>
                        <Select
                          defaultValue={selectedReport.status}
                          onValueChange={(value) => setSelectedReport({
                            ...selectedReport,
                            status: value
                          })}
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label>Admin Notes</Label>
                        <Textarea
                          placeholder="Add admin notes..."
                          rows={3}
                          id="adminNotes"
                          defaultValue={selectedReport.admin_notes || ''}
                        />
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => setSelectedReport(null)}
                        >
                          Close
                        </Button>
                        <Button
                          onClick={() => {
                            const notes = (document.getElementById('adminNotes') as HTMLTextAreaElement)?.value || ''
                            updateReportStatus(selectedReport.id, selectedReport.status, notes)
                          }}
                        >
                          Update Report
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* Bookings Management */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Bookings Management</h2>
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">
                  Booking management features coming soon. This will include calendar view, 
                  booking modifications, and administrative booking controls.
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Settings */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">System Settings</h2>
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">
                  System settings management coming soon. This will include studio capacity, 
                  point values, booking rules, and email templates.
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
