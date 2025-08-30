"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase/client"
import {
  Calendar, Home, User, Menu, X, Clock, Sparkles,
  ChevronRight, Bell, Settings, LogOut, Plus, Minus,
  Check, AlertCircle, TrendingUp, CalendarDays,
  Zap, Award, Target, Activity
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { format, isToday, isTomorrow, parseISO, addDays, startOfWeek } from "date-fns"
import TimeSlotPicker from "./time-slot-picker"
import MyBookings from "./my-bookings"

interface DashboardProps {
  userId: string
  userEmail: string
  isAdmin: boolean
  initialBookings?: any[]
  weekendSlotsUsed?: number
}

interface Stats {
  monthlyPoints: number
  monthlyPointsMax: number
  weekendSlotsUsed: number
  weekendSlotsMax: number
  upcomingBookings: number
  totalBookingsThisMonth: number
}

export default function MobileOptimizedDashboard({
  userId,
  userEmail,
  isAdmin,
  initialBookings = [],
  weekendSlotsUsed = 0
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'home' | 'book' | 'bookings' | 'profile'>('home')
  const [stats, setStats] = useState<Stats>({
    monthlyPoints: 40,
    monthlyPointsMax: 40,
    weekendSlotsUsed: 0,
    weekendSlotsMax: 12,
    upcomingBookings: 0,
    totalBookingsThisMonth: 0
  })
  const [loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [bookings, setBookings] = useState(initialBookings)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showQuickStats, setShowQuickStats] = useState(true)

  useEffect(() => {
    loadUserStats()
    loadBookings()

    // Real-time subscription
    const subscription = supabase
      .channel('dashboard-updates')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'bookings',
        filter: `member_id=eq.${userId}`
      }, () => {
        loadBookings()
        loadUserStats()
      })
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [userId])

  const loadUserStats = async () => {
    try {
      const { data: member } = await supabase
        .from('members')
        .select('monthly_points, monthly_points_max, weekend_slots_used, weekend_slots_max')
        .eq('auth_id', userId)
        .single()

      const { data: upcomingBookings } = await supabase
        .from('bookings')
        .select('id')
        .eq('member_id', userId)
        .gte('start_time', new Date().toISOString())

      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const { data: monthlyBookings } = await supabase
        .from('bookings')
        .select('id')
        .eq('member_id', userId)
        .gte('created_at', startOfMonth.toISOString())

      if (member) {
        setStats({
          monthlyPoints: member.monthly_points || 40,
          monthlyPointsMax: member.monthly_points_max || 40,
          weekendSlotsUsed: member.weekend_slots_used || 0,
          weekendSlotsMax: member.weekend_slots_max || 12,
          upcomingBookings: upcomingBookings?.length || 0,
          totalBookingsThisMonth: monthlyBookings?.length || 0
        })
      }
    } catch (error) {
      console.error('Error loading stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadBookings = async () => {
    try {
      const { data } = await supabase
        .from('bookings')
        .select('*')
        .eq('member_id', userId)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(10)

      setBookings(data || [])
    } catch (error) {
      console.error('Error loading bookings:', error)
    }
  }

  const handleQuickBook = async (duration: number) => {
    // Quick booking logic for common durations
    toast.success(`Quick booking for ${duration} minutes initiated`)
    setActiveTab('book')
  }

  // Mobile-optimized stat card
  const StatCard = ({ icon: Icon, label, value, max, color }: any) => (
    <Card className="bg-zinc-900/50 border-zinc-800 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className={`h-4 w-4 ${color}`} />
          <span className="text-xs text-zinc-400">{label}</span>
        </div>
        <span className="text-lg font-bold text-white">
          {value}{max && <span className="text-xs text-zinc-500">/{max}</span>}
        </span>
      </div>
      {max && (
        <Progress 
          value={(value / max) * 100} 
          className="h-1.5"
        />
      )}
    </Card>
  )

  // Quick action buttons
  const QuickAction = ({ icon: Icon, label, onClick, variant = "default" }: any) => (
    <Button
      onClick={onClick}
      variant={variant}
      className="flex-1 h-20 flex flex-col items-center justify-center gap-2 bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800"
    >
      <Icon className="h-5 w-5" />
      <span className="text-xs">{label}</span>
    </Button>
  )

  // Mobile bottom navigation
  const MobileNav = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur border-t border-zinc-800 md:hidden z-50">
      <div className="grid grid-cols-4 gap-0">
        {[
          { id: 'home', icon: Home, label: 'Home' },
          { id: 'book', icon: Plus, label: 'Book' },
          { id: 'bookings', icon: CalendarDays, label: 'My Bookings' },
          { id: 'profile', icon: User, label: 'Profile' }
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={`flex flex-col items-center justify-center py-3 px-2 transition-colors ${
              activeTab === item.id 
                ? 'text-amber-400 bg-amber-400/10' 
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <item.icon className="h-5 w-5 mb-1" />
            <span className="text-xs">{item.label}</span>
            {item.id === 'bookings' && stats.upcomingBookings > 0 && (
              <span className="absolute top-2 right-1/4 h-2 w-2 bg-amber-400 rounded-full" />
            )}
          </button>
        ))}
      </div>
    </div>
  )

  // Upcoming booking card
  const UpcomingBookingCard = ({ booking }: any) => {
    const startTime = parseISO(booking.start_time)
    const endTime = parseISO(booking.end_time)
    const isNextBooking = isToday(startTime) || isTomorrow(startTime)

    return (
      <Card className={`bg-zinc-900/50 border-zinc-800 ${isNextBooking ? 'ring-2 ring-amber-400/50' : ''}`}>
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <p className="text-sm font-medium text-white">
                {isToday(startTime) ? 'Today' : 
                 isTomorrow(startTime) ? 'Tomorrow' : 
                 format(startTime, 'EEE, MMM d')}
              </p>
              <p className="text-xs text-zinc-400">
                {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
              </p>
            </div>
            <Badge variant={booking.slot_type === 'weekend' ? 'default' : 'secondary'}>
              {booking.points_cost} pts
            </Badge>
          </div>
          {isNextBooking && (
            <div className="flex items-center gap-2 mt-3 p-2 bg-amber-400/10 rounded-lg">
              <Bell className="h-4 w-4 text-amber-400" />
              <span className="text-xs text-amber-400">Next booking</span>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-zinc-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black pb-20 md:pb-0">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/95 backdrop-blur border-b border-zinc-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-amber-400" />
              <div>
                <h1 className="text-lg font-bold text-white">ICU Studio</h1>
                <p className="text-xs text-zinc-400">Welcome back!</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5 text-zinc-400" />
                {stats.upcomingBookings > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-amber-400 rounded-full text-xs text-black flex items-center justify-center font-bold">
                    {stats.upcomingBookings}
                  </span>
                )}
              </Button>
              
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5 text-zinc-400" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 bg-zinc-950 border-zinc-800">
                  <SheetHeader>
                    <SheetTitle className="text-white">Menu</SheetTitle>
                  </SheetHeader>
                  <nav className="mt-6 space-y-2">
                    {isAdmin && (
                      <Button 
                        variant="outline" 
                        className="w-full justify-start border-amber-600/50 text-amber-400"
                        onClick={() => window.location.href = '/admin'}
                      >
                        <Shield className="mr-2 h-4 w-4" />
                        Admin Panel
                      </Button>
                    )}
                    <Button variant="ghost" className="w-full justify-start">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Button>
                    <Button variant="ghost" className="w-full justify-start">
                      <Activity className="mr-2 h-4 w-4" />
                      Activity Log
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-red-400">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {/* Home Tab */}
        {activeTab === 'home' && (
          <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-amber-600/20 to-orange-600/20 rounded-xl p-6 border border-amber-600/30">
              <h2 className="text-xl font-bold text-white mb-2">
                Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}!
              </h2>
              <p className="text-sm text-zinc-300">
                You have {stats.monthlyPoints} points remaining this month
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                icon={Zap}
                label="Points"
                value={stats.monthlyPoints}
                max={stats.monthlyPointsMax}
                color="text-amber-400"
              />
              <StatCard
                icon={Calendar}
                label="Weekend Slots"
                value={stats.weekendSlotsUsed}
                max={stats.weekendSlotsMax}
                color="text-blue-400"
              />
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="text-sm font-medium text-zinc-400 mb-3">Quick Book</h3>
              <div className="grid grid-cols-3 gap-3">
                <QuickAction
                  icon={Clock}
                  label="30 min"
                  onClick={() => handleQuickBook(30)}
                />
                <QuickAction
                  icon={Clock}
                  label="1 hour"
                  onClick={() => handleQuickBook(60)}
                />
                <QuickAction
                  icon={Clock}
                  label="2 hours"
                  onClick={() => handleQuickBook(120)}
                />
              </div>
            </div>

            {/* Next Booking */}
            {bookings.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-zinc-400 mb-3">Your Next Booking</h3>
                <UpcomingBookingCard booking={bookings[0]} />
              </div>
            )}

            {/* Activity Summary */}
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white text-base">This Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-400">Total Bookings</span>
                    <span className="text-sm font-medium text-white">{stats.totalBookingsThisMonth}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-400">Points Used</span>
                    <span className="text-sm font-medium text-white">
                      {stats.monthlyPointsMax - stats.monthlyPoints}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-400">Upcoming</span>
                    <span className="text-sm font-medium text-amber-400">{stats.upcomingBookings}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Book Tab */}
        {activeTab === 'book' && (
          <div className="space-y-6">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Book a Slot</h2>
                <Badge variant="outline" className="border-amber-600 text-amber-400">
                  {stats.monthlyPoints} pts available
                </Badge>
              </div>
              
              {/* Mobile-optimized time slot picker */}
              <TimeSlotPicker
                userId={userId}
                userEmail={userEmail}
                weekendSlotsUsed={stats.weekendSlotsUsed}
              />
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">My Bookings</h2>
              <Button 
                variant="outline" 
                size="sm"
                className="border-amber-600/50 text-amber-400"
                onClick={() => setActiveTab('book')}
              >
                <Plus className="h-4 w-4 mr-1" />
                New
              </Button>
            </div>
            
            <MyBookings
              userId={userId}
              userEmail={userEmail}
              initialBookings={bookings}
            />
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-zinc-400 mb-1">Email</p>
                  <p className="text-sm text-white">{userEmail}</p>
                </div>
                
                <div>
                  <p className="text-xs text-zinc-400 mb-1">Member ID</p>
                  <p className="text-sm text-white font-mono">{userId.slice(0, 8)}</p>
                </div>
                
                <div>
                  <p className="text-xs text-zinc-400 mb-1">Status</p>
                  <Badge variant="default" className="bg-green-600">Active</Badge>
                </div>
                
                {isAdmin && (
                  <div>
                    <p className="text-xs text-zinc-400 mb-1">Role</p>
                    <Badge variant="default" className="bg-amber-600">Admin</Badge>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Points & Limits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-zinc-400">Monthly Points</span>
                    <span className="text-sm font-medium text-white">
                      {stats.monthlyPoints}/{stats.monthlyPointsMax}
                    </span>
                  </div>
                  <Progress value={(stats.monthlyPoints / stats.monthlyPointsMax) * 100} />
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-zinc-400">Weekend Slots</span>
                    <span className="text-sm font-medium text-white">
                      {stats.weekendSlotsUsed}/{stats.weekendSlotsMax}
                    </span>
                  </div>
                  <Progress value={(stats.weekendSlotsUsed / stats.weekendSlotsMax) * 100} />
                </div>
                
                <div className="pt-2 border-t border-zinc-800">
                  <p className="text-xs text-zinc-500">
                    Points refresh on the 1st of each month
                  </p>
                  <p className="text-xs text-zinc-500 mt-1">
                    Weekend slots reset every Monday
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <div className="h-12 w-12 bg-amber-600/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Award className="h-6 w-6 text-amber-400" />
                    </div>
                    <p className="text-xs text-zinc-400">Early Bird</p>
                  </div>
                  <div className="text-center">
                    <div className="h-12 w-12 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Target className="h-6 w-6 text-blue-400" />
                    </div>
                    <p className="text-xs text-zinc-400">Regular</p>
                  </div>
                  <div className="text-center opacity-50">
                    <div className="h-12 w-12 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-2">
                      <TrendingUp className="h-6 w-6 text-zinc-600" />
                    </div>
                    <p className="text-xs text-zinc-600">Power User</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  )
}