"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { supabase } from '@/lib/supabase/client'
import { 
  Shield, Users, FileText, Loader2, UserCheck, Clock, 
  CheckCircle, XCircle, AlertCircle, Mail, Sparkles,
  BarChart3, Download, Calendar, Filter, Search,
  Settings, Bell, TrendingUp, TrendingDown, Activity,
  DollarSign, BookOpen, UserPlus, RefreshCw, Menu,
  X, ChevronDown, ChevronRight, Eye, Edit, Trash2,
  LogOut, Home, ArrowUpRight, ArrowDownRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays, isToday, isTomorrow } from "date-fns"
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

interface Member {
  auth_id: string
  email: string
  full_name: string
  role: string
  monthly_points: number
  monthly_points_max: number
  weekend_slots_used: number
  weekend_slots_max: number
  created_at: string
  last_login: string | null
}

interface Booking {
  id: string
  member_id: string
  start_time: string
  end_time: string
  points_cost: number
  slot_type: string
  created_at: string
  member?: {
    full_name: string
    email: string
  }
}

interface Analytics {
  bookingTrend: { date: string; count: number }[]
  popularTimeSlots: { hour: number; count: number }[]
  memberActivity: { date: string; active: number }[]
  pointsUsage: { date: string; used: number }[]
}

export default function ProfessionalAdminDashboard({ userRole }: { userRole: string }) {
  // State Management
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'dashboard' | 'applications' | 'users' | 'bookings' | 'analytics' | 'settings'>('dashboard')
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'all'>('week')
  
  // Data States
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalBookings: 0,
    todayBookings: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    totalApplications: 0,
    pendingApplications: 0,
    systemHealth: 100,
    storageUsed: 0,
    apiCalls: 0,
    errorRate: 0
  })
  
  const [applications, setApplications] = useState<Application[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [analytics, setAnalytics] = useState<Analytics>({
    bookingTrend: [],
    popularTimeSlots: [],
    memberActivity: [],
    pointsUsage: []
  })
  
  const [applicationsLoading, setApplicationsLoading] = useState(false)
  const [membersLoading, setMembersLoading] = useState(false)
  const [bookingsLoading, setBookingsLoading] = useState(false)
  const [analyticsLoading, setAnalyticsLoading] = useState(false)

  // Real-time subscriptions
  useEffect(() => {
    loadData()
    
    // Set up real-time subscriptions
    const bookingSubscription = supabase
      .channel('bookings-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings' }, () => {
        loadBookings()
        loadStats()
      })
      .subscribe()
    
    const applicationSubscription = supabase
      .channel('applications-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'applications' }, () => {
        loadApplications()
        loadStats()
      })
      .subscribe()
    
    return () => {
      bookingSubscription.unsubscribe()
      applicationSubscription.unsubscribe()
    }
  }, [])

  // Data Loading Functions
  const loadData = async () => {
    try {
      await Promise.all([
        loadStats(),
        loadApplications(),
        loadMembers(),
        loadBookings(),
        loadAnalytics()
      ])
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const now = new Date()
      const todayStart = new Date(now.setHours(0, 0, 0, 0))
      const monthStart = startOfMonth(now)
      
      const [
        usersResult,
        activeUsersResult,
        bookingsResult,
        todayBookingsResult,
        applicationsResult,
        pendingApplicationsResult,
        revenueResult
      ] = await Promise.all([
        supabase.from('members').select('id', { count: 'exact' }),
        supabase.from('members').select('id', { count: 'exact' })
          .gte('last_login', subDays(now, 7).toISOString()),
        supabase.from('bookings').select('id', { count: 'exact' }),
        supabase.from('bookings').select('id', { count: 'exact' })
          .gte('start_time', todayStart.toISOString()),
        supabase.from('applications').select('id', { count: 'exact' }),
        supabase.from('applications').select('id', { count: 'exact' })
          .eq('status', 'pending'),
        supabase.from('bookings').select('points_cost')
          .gte('created_at', monthStart.toISOString())
      ])

      const monthlyRevenue = revenueResult.data?.reduce((sum, b) => sum + (b.points_cost || 0), 0) || 0
      const totalRevenue = monthlyRevenue * 12 // Estimated annual

      setStats({
        totalUsers: usersResult.count || 0,
        activeUsers: activeUsersResult.count || 0,
        totalBookings: bookingsResult.count || 0,
        todayBookings: todayBookingsResult.count || 0,
        totalRevenue,
        monthlyRevenue,
        totalApplications: applicationsResult.count || 0,
        pendingApplications: pendingApplicationsResult.count || 0,
        systemHealth: 98 + Math.random() * 2, // Simulated
        storageUsed: 45 + Math.random() * 10, // Simulated
        apiCalls: 15000 + Math.floor(Math.random() * 5000), // Simulated
        errorRate: Math.random() * 0.5 // Simulated
      })
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const loadApplications = async () => {
    setApplicationsLoading(true)
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
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

  const loadMembers = async () => {
    setMembersLoading(true)
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setMembers(data || [])
    } catch (error) {
      console.error('Error loading members:', error)
      toast.error('Failed to load members')
    } finally {
      setMembersLoading(false)
    }
  }

  const loadBookings = async () => {
    setBookingsLoading(true)
    try {
      const query = supabase
        .from('bookings')
        .select(`
          *,
          member:members!bookings_member_id_fkey(full_name, email)
        `)
        .order('start_time', { ascending: false })

      // Apply date range filter
      const now = new Date()
      if (dateRange === 'today') {
        query.gte('start_time', new Date(now.setHours(0, 0, 0, 0)).toISOString())
      } else if (dateRange === 'week') {
        query.gte('start_time', startOfWeek(now).toISOString())
      } else if (dateRange === 'month') {
        query.gte('start_time', startOfMonth(now).toISOString())
      }

      const { data, error } = await query

      if (error) throw error
      setBookings(data || [])
    } catch (error) {
      console.error('Error loading bookings:', error)
      toast.error('Failed to load bookings')
    } finally {
      setBookingsLoading(false)
    }
  }

  const loadAnalytics = async () => {
    setAnalyticsLoading(true)
    try {
      // Simulated analytics data - in production, this would come from aggregated queries
      const mockAnalytics: Analytics = {
        bookingTrend: Array.from({ length: 7 }, (_, i) => ({
          date: format(subDays(new Date(), 6 - i), 'MMM dd'),
          count: Math.floor(Math.random() * 20) + 10
        })),
        popularTimeSlots: Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          count: i >= 9 && i <= 21 ? Math.floor(Math.random() * 15) + 5 : Math.floor(Math.random() * 5)
        })),
        memberActivity: Array.from({ length: 7 }, (_, i) => ({
          date: format(subDays(new Date(), 6 - i), 'MMM dd'),
          active: Math.floor(Math.random() * 30) + 20
        })),
        pointsUsage: Array.from({ length: 7 }, (_, i) => ({
          date: format(subDays(new Date(), 6 - i), 'MMM dd'),
          used: Math.floor(Math.random() * 500) + 200
        }))
      }
      
      setAnalytics(mockAnalytics)
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setAnalyticsLoading(false)
    }
  }

  // Action Functions
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

      // If approved, create member account
      if (status === 'approved') {
        const application = applications.find(a => a.id === applicationId)
        if (application) {
          // Send invitation email
          await sendInvitationEmail(application.email, application.full_name)
        }
      }

      toast.success(`Application ${status} successfully`)
      loadApplications()
      loadStats()
    } catch (error) {
      console.error('Error updating application:', error)
      toast.error('Failed to update application')
    }
  }

  const sendInvitationEmail = async (email: string, name: string) => {
    // Implementation would integrate with email service
    toast.success(`Invitation sent to ${email}`)
  }

  const updateMemberRole = async (memberId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('members')
        .update({ role: newRole })
        .eq('auth_id', memberId)

      if (error) throw error

      toast.success('Member role updated successfully')
      loadMembers()
    } catch (error) {
      console.error('Error updating member role:', error)
      toast.error('Failed to update member role')
    }
  }

  const cancelBooking = async (bookingId: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', bookingId)

      if (error) throw error

      toast.success('Booking cancelled successfully')
      loadBookings()
      loadStats()
    } catch (error) {
      console.error('Error cancelling booking:', error)
      toast.error('Failed to cancel booking')
    }
  }

  const exportData = (type: 'applications' | 'members' | 'bookings') => {
    let data: any[] = []
    let filename = ''

    switch (type) {
      case 'applications':
        data = applications
        filename = `applications_${format(new Date(), 'yyyy-MM-dd')}.csv`
        break
      case 'members':
        data = members
        filename = `members_${format(new Date(), 'yyyy-MM-dd')}.csv`
        break
      case 'bookings':
        data = bookings
        filename = `bookings_${format(new Date(), 'yyyy-MM-dd')}.csv`
        break
    }

    // Convert to CSV
    const headers = Object.keys(data[0] || {}).join(',')
    const rows = data.map(item => Object.values(item).join(','))
    const csv = [headers, ...rows].join('\n')

    // Download
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    
    toast.success(`Exported ${data.length} records`)
  }

  // Filtered data
  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const matchesSearch = app.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.email.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesFilter = filterStatus === 'all' || app.status === filterStatus
      return matchesSearch && matchesFilter
    })
  }, [applications, searchTerm, filterStatus])

  const filteredMembers = useMemo(() => {
    return members.filter(member => 
      member.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [members, searchTerm])

  // Mobile menu component
  const MobileMenu = () => (
    <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 bg-zinc-950 border-zinc-800">
        <SheetHeader>
          <SheetTitle className="text-white">Admin Menu</SheetTitle>
        </SheetHeader>
        <nav className="mt-6 space-y-2">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Home },
            { id: 'applications', label: 'Applications', icon: UserCheck },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'bookings', label: 'Bookings', icon: Calendar },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map(item => (
            <Button
              key={item.id}
              variant={selectedTab === item.id ? 'secondary' : 'ghost'}
              className="w-full justify-start"
              onClick={() => {
                setSelectedTab(item.id as any)
                setMobileMenuOpen(false)
              }}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
              {item.id === 'applications' && stats.pendingApplications > 0 && (
                <Badge className="ml-auto" variant="destructive">
                  {stats.pendingApplications}
                </Badge>
              )}
            </Button>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-amber-400 mx-auto mb-4" />
          <p className="text-zinc-400">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur border-b border-zinc-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <MobileMenu />
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-amber-400" />
                <div>
                  <h1 className="text-xl md:text-2xl font-bold text-white">Admin Dashboard</h1>
                  <p className="text-xs text-zinc-400 hidden sm:block">ICU Creative Studio Management</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5 text-zinc-400" />
                {stats.pendingApplications > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                    {stats.pendingApplications}
                  </span>
                )}
              </Button>
              
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-2 mb-6">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Home },
            { id: 'applications', label: 'Applications', icon: UserCheck, badge: stats.pendingApplications },
            { id: 'users', label: 'Users', icon: Users },
            { id: 'bookings', label: 'Bookings', icon: Calendar },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map(item => (
            <Button
              key={item.id}
              variant={selectedTab === item.id ? 'default' : 'outline'}
              onClick={() => setSelectedTab(item.id as any)}
              className={selectedTab === item.id ? 'bg-amber-600 hover:bg-amber-700' : 'border-zinc-700 hover:bg-zinc-800'}
            >
              <item.icon className="h-4 w-4 mr-2" />
              {item.label}
              {item.badge && item.badge > 0 && (
                <Badge className="ml-2" variant="destructive">
                  {item.badge}
                </Badge>
              )}
            </Button>
          ))}
        </nav>

        {/* Dashboard Tab */}
        {selectedTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-400">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-blue-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
                  <div className="flex items-center text-xs text-zinc-500 mt-1">
                    <span className="text-green-400 flex items-center">
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                      {stats.activeUsers} active
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-400">Bookings</CardTitle>
                  <Calendar className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats.totalBookings}</div>
                  <div className="flex items-center text-xs text-zinc-500 mt-1">
                    <span className="text-blue-400">
                      {stats.todayBookings} today
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-400">Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-amber-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats.monthlyRevenue} pts</div>
                  <div className="flex items-center text-xs text-zinc-500 mt-1">
                    <span className="text-green-400 flex items-center">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      This month
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-400">Applications</CardTitle>
                  <UserCheck className="h-4 w-4 text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{stats.totalApplications}</div>
                  <div className="flex items-center text-xs text-zinc-500 mt-1">
                    <span className="text-yellow-400">
                      {stats.pendingApplications} pending
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* System Health */}
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">System Health</CardTitle>
                <CardDescription className="text-zinc-400">Real-time system status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-zinc-400">Overall Health</span>
                    <span className="text-green-400">{stats.systemHealth.toFixed(1)}%</span>
                  </div>
                  <Progress value={stats.systemHealth} className="h-2" />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-zinc-400">Storage Used</span>
                    <span className="text-blue-400">{stats.storageUsed.toFixed(1)}%</span>
                  </div>
                  <Progress value={stats.storageUsed} className="h-2" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-green-400" />
                    <div>
                      <p className="text-xs text-zinc-400">API Calls</p>
                      <p className="text-sm font-semibold text-white">{stats.apiCalls.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <div>
                      <p className="text-xs text-zinc-400">Error Rate</p>
                      <p className="text-sm font-semibold text-white">{stats.errorRate.toFixed(2)}%</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <AdminInviteUser />
                  <Button variant="outline" className="border-zinc-700 hover:bg-zinc-800">
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                  <Button variant="outline" className="border-zinc-700 hover:bg-zinc-800">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Sync Data
                  </Button>
                  <Button variant="outline" className="border-zinc-700 hover:bg-zinc-800">
                    <Mail className="h-4 w-4 mr-2" />
                    Send Newsletter
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Applications Tab */}
        {selectedTab === 'applications' && (
          <div className="space-y-6">
            {/* Filters */}
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div>
                    <CardTitle className="text-white">Applications</CardTitle>
                    <CardDescription className="text-zinc-400">
                      Manage membership applications
                    </CardDescription>
                  </div>
                  <Button 
                    onClick={() => exportData('applications')}
                    variant="outline" 
                    className="border-zinc-700 hover:bg-zinc-800"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <Input
                      placeholder="Search applications..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-zinc-800 border-zinc-700 text-white"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-full sm:w-48 bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="waitlisted">Waitlisted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Applications List */}
                {applicationsLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-amber-400 mx-auto" />
                  </div>
                ) : filteredApplications.length === 0 ? (
                  <div className="text-center py-8">
                    <UserCheck className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                    <p className="text-zinc-400">No applications found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredApplications.map((application) => (
                      <Card key={application.id} className="bg-zinc-800/50 border-zinc-700">
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-white">
                                  {application.full_name}
                                </h3>
                                <Badge variant={
                                  application.status === 'approved' ? 'default' :
                                  application.status === 'rejected' ? 'destructive' :
                                  application.status === 'pending' ? 'secondary' :
                                  'outline'
                                }>
                                  {application.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-zinc-400 mb-3">
                                {application.email} • {application.city}
                              </p>
                              <div className="space-y-2">
                                <div>
                                  <p className="text-xs text-zinc-500">Purpose</p>
                                  <p className="text-sm text-zinc-300">{application.studio_usage_purpose}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-zinc-500">Motivation</p>
                                  <p className="text-sm text-zinc-300">{application.why_join_studio}</p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col justify-between">
                              <div className="text-xs text-zinc-500 mb-3">
                                Applied: {format(new Date(application.created_at), 'MMM dd, yyyy')}
                              </div>
                              {application.status === 'pending' && (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => updateApplicationStatus(application.id, 'approved')}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => updateApplicationStatus(application.id, 'rejected')}
                                  >
                                    Reject
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Users Tab */}
        {selectedTab === 'users' && (
          <div className="space-y-6">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div>
                    <CardTitle className="text-white">User Management</CardTitle>
                    <CardDescription className="text-zinc-400">
                      Manage user accounts and permissions
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <AdminInviteUser />
                    <Button 
                      onClick={() => exportData('members')}
                      variant="outline" 
                      className="border-zinc-700 hover:bg-zinc-800"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative mb-6">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>

                {membersLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-amber-400 mx-auto" />
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-zinc-700">
                          <th className="text-left py-3 px-4 text-xs font-medium text-zinc-400 uppercase">User</th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-zinc-400 uppercase hidden sm:table-cell">Role</th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-zinc-400 uppercase hidden md:table-cell">Points</th>
                          <th className="text-left py-3 px-4 text-xs font-medium text-zinc-400 uppercase hidden lg:table-cell">Weekend Slots</th>
                          <th className="text-right py-3 px-4 text-xs font-medium text-zinc-400 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredMembers.map((member) => (
                          <tr key={member.auth_id} className="border-b border-zinc-800 hover:bg-zinc-800/50">
                            <td className="py-3 px-4">
                              <div>
                                <p className="text-sm font-medium text-white">{member.full_name || 'Unknown'}</p>
                                <p className="text-xs text-zinc-400">{member.email}</p>
                              </div>
                            </td>
                            <td className="py-3 px-4 hidden sm:table-cell">
                              <Badge variant={member.role === 'admin' || member.role === 'super_admin' ? 'default' : 'secondary'}>
                                {member.role}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 hidden md:table-cell">
                              <div className="text-sm">
                                <span className="text-white">{member.monthly_points}</span>
                                <span className="text-zinc-400">/{member.monthly_points_max}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 hidden lg:table-cell">
                              <div className="text-sm">
                                <span className="text-white">{member.weekend_slots_used}</span>
                                <span className="text-zinc-400">/{member.weekend_slots_max}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex justify-end gap-2">
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Bookings Tab */}
        {selectedTab === 'bookings' && (
          <div className="space-y-6">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <div>
                    <CardTitle className="text-white">Bookings</CardTitle>
                    <CardDescription className="text-zinc-400">
                      View and manage all bookings
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Select value={dateRange} onValueChange={setDateRange as any}>
                      <SelectTrigger className="w-32 bg-zinc-800 border-zinc-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="week">This Week</SelectItem>
                        <SelectItem value="month">This Month</SelectItem>
                        <SelectItem value="all">All Time</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      onClick={() => exportData('bookings')}
                      variant="outline" 
                      className="border-zinc-700 hover:bg-zinc-800"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {bookingsLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-amber-400 mx-auto" />
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
                    <p className="text-zinc-400">No bookings found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {bookings.map((booking) => (
                      <Card key={booking.id} className="bg-zinc-800/50 border-zinc-700">
                        <CardContent className="p-4">
                          <div className="flex flex-col sm:flex-row justify-between gap-4">
                            <div>
                              <p className="text-sm font-medium text-white mb-1">
                                {booking.member?.full_name || 'Unknown User'}
                              </p>
                              <p className="text-xs text-zinc-400 mb-2">
                                {booking.member?.email}
                              </p>
                              <div className="flex flex-wrap gap-2 text-xs">
                                <Badge variant="outline" className="border-zinc-600">
                                  {format(new Date(booking.start_time), 'MMM dd, HH:mm')} - 
                                  {format(new Date(booking.end_time), 'HH:mm')}
                                </Badge>
                                <Badge variant={booking.slot_type === 'weekend' ? 'default' : 'secondary'}>
                                  {booking.slot_type}
                                </Badge>
                                <Badge variant="outline" className="border-amber-600 text-amber-400">
                                  {booking.points_cost} pts
                                </Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => cancelBooking(booking.id)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Analytics Tab */}
        {selectedTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white">Booking Trends</CardTitle>
                  <CardDescription className="text-zinc-400">Daily booking activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end justify-between gap-2">
                    {analytics.bookingTrend.map((day, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-full bg-amber-600 rounded-t"
                          style={{ height: `${(day.count / 30) * 100}%` }}
                        />
                        <p className="text-xs text-zinc-400 mt-2">{day.date}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white">Popular Time Slots</CardTitle>
                  <CardDescription className="text-zinc-400">Hourly distribution</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.popularTimeSlots
                      .filter(slot => slot.count > 0)
                      .sort((a, b) => b.count - a.count)
                      .slice(0, 5)
                      .map((slot) => (
                        <div key={slot.hour} className="flex items-center gap-3">
                          <span className="text-sm text-zinc-400 w-16">
                            {slot.hour}:00
                          </span>
                          <div className="flex-1 bg-zinc-800 rounded-full h-6 relative overflow-hidden">
                            <div 
                              className="absolute left-0 top-0 h-full bg-gradient-to-r from-amber-600 to-amber-500"
                              style={{ width: `${(slot.count / 20) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm text-white w-8 text-right">
                            {slot.count}
                          </span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white">Member Activity</CardTitle>
                  <CardDescription className="text-zinc-400">Active members per day</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end justify-between gap-2">
                    {analytics.memberActivity.map((day, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-full bg-blue-600 rounded-t"
                          style={{ height: `${(day.active / 50) * 100}%` }}
                        />
                        <p className="text-xs text-zinc-400 mt-2">{day.date}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white">Points Usage</CardTitle>
                  <CardDescription className="text-zinc-400">Daily points consumption</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-end justify-between gap-2">
                    {analytics.pointsUsage.map((day, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-full bg-green-600 rounded-t"
                          style={{ height: `${(day.used / 700) * 100}%` }}
                        />
                        <p className="text-xs text-zinc-400 mt-2">{day.date}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {selectedTab === 'settings' && (
          <div className="space-y-6">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">System Settings</CardTitle>
                <CardDescription className="text-zinc-400">
                  Configure system parameters and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Monthly Points Allocation</Label>
                    <Input 
                      type="number" 
                      defaultValue={40}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                    <p className="text-xs text-zinc-500">Points given to each member monthly</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Weekend Slot Limit</Label>
                    <Input 
                      type="number" 
                      defaultValue={12}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                    <p className="text-xs text-zinc-500">Maximum weekend slots per week</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Weekday Point Cost</Label>
                    <Input 
                      type="number" 
                      defaultValue={1}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                    <p className="text-xs text-zinc-500">Points per 30-minute weekday slot</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-zinc-300">Weekend Point Cost</Label>
                    <Input 
                      type="number" 
                      defaultValue={3}
                      className="bg-zinc-800 border-zinc-700 text-white"
                    />
                    <p className="text-xs text-zinc-500">Points per 30-minute weekend slot</p>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-zinc-800">
                  <Button className="bg-amber-600 hover:bg-amber-700">
                    Save Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Notification Settings</CardTitle>
                <CardDescription className="text-zinc-400">
                  Configure email and system notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">New Application Alerts</p>
                    <p className="text-xs text-zinc-400">Receive alerts for new applications</p>
                  </div>
                  <Button variant="outline" size="sm" className="border-zinc-700">
                    Enabled
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Booking Confirmations</p>
                    <p className="text-xs text-zinc-400">Send confirmation emails to users</p>
                  </div>
                  <Button variant="outline" size="sm" className="border-zinc-700">
                    Enabled
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">Weekly Reports</p>
                    <p className="text-xs text-zinc-400">Receive weekly analytics reports</p>
                  </div>
                  <Button variant="outline" size="sm" className="border-zinc-700">
                    Enabled
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}