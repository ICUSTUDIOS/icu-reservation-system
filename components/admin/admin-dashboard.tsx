"use client"

import { useState, useEffect } from "react"
import { supabase } from '@/lib/supabase/client'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  Shield, 
  FileText, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  User, 
  Calendar,
  Filter,
  Search,
  Download,
  Eye,
  Edit,
  Trash2
} from "lucide-react"
import { toast } from "sonner"
import { format } from 'date-fns'

interface Report {
  id: string
  member_id: string
  subject: string
  description: string
  contact_info: string | null
  status: 'pending' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  report_type: 'general' | 'cleanliness' | 'equipment' | 'supply' | 'damage' | 'safety'
  created_at: string
  updated_at: string
  resolved_at: string | null
  admin_notes: string | null
  resolved_by: string | null
  members: {
    email: string
  }
  report_files: {
    id: string
    file_name: string
    file_type: string
    file_size: number
    file_url: string
    uploaded_at: string
  }[]
}

interface Member {
  id: string
  email: string
  role: string
  monthly_points: number
  weekend_slots_used: number
  created_at: string
}

export default function AdminDashboard() {
  const [reports, setReports] = useState<Report[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [adminNotes, setAdminNotes] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterPriority, setFilterPriority] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")

  const supabaseClient = supabase

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    
    // Fetch reports with member info and files
    const { data: reportsData, error: reportsError } = await supabaseClient
      .from('reports')
      .select(`
        *,
        members (email),
        report_files (*)
      `)
      .order('created_at', { ascending: false })

    if (reportsError) {
      toast.error('Failed to fetch reports')
      console.error('Reports error:', reportsError)
    } else {
      setReports(reportsData || [])
    }

    // Fetch members
    const { data: membersData, error: membersError } = await supabaseClient
      .from('members')
      .select('*')
      .order('created_at', { ascending: false })

    if (membersError) {
      toast.error('Failed to fetch members')
      console.error('Members error:', membersError)
    } else {
      setMembers(membersData || [])
    }

    setLoading(false)
  }

  const updateReportStatus = async (reportId: string, status: string, notes?: string) => {
    const updateData: any = { 
      status, 
      updated_at: new Date().toISOString() 
    }
    
    if (notes) {
      updateData.admin_notes = notes
    }
    
    if (status === 'resolved') {
      updateData.resolved_at = new Date().toISOString()
      
      // Get current admin user
      const { data: { user } } = await supabaseClient.auth.getUser()
      if (user) {
        const { data: member } = await supabaseClient
          .from('members')
          .select('id')
          .eq('auth_id', user.id)
          .single()
        if (member) {
          updateData.resolved_by = member.id
        }
      }
    }

    const { error } = await supabaseClient
      .from('reports')
      .update(updateData)
      .eq('id', reportId)

    if (error) {
      toast.error('Failed to update report')
      console.error('Update error:', error)
    } else {
      toast.success('Report updated successfully')
      fetchData()
      setSelectedReport(null)
      setAdminNotes("")
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
      case 'in_progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/50'
      case 'resolved': return 'bg-green-500/20 text-green-400 border-green-500/50'
      case 'closed': return 'bg-gray-500/20 text-gray-400 border-gray-500/50'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/50'
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
      case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/50'
      case 'urgent': return 'bg-red-500/20 text-red-400 border-red-500/50'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/50'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'cleanliness': return '🧹'
      case 'equipment': return '🔧'
      case 'supply': return '📦'
      case 'damage': return '⚠️'
      case 'safety': return '🚨'
      default: return '📝'
    }
  }

  const filteredReports = reports.filter(report => {
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus
    const matchesPriority = filterPriority === 'all' || report.priority === filterPriority
    const matchesSearch = searchTerm === '' || 
      report.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.members.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesStatus && matchesPriority && matchesSearch
  })

  const stats = {
    totalReports: reports.length,
    pendingReports: reports.filter(r => r.status === 'pending').length,
    inProgressReports: reports.filter(r => r.status === 'in_progress').length,
    resolvedReports: reports.filter(r => r.status === 'resolved').length,
    totalMembers: members.length,
    adminMembers: members.filter(m => ['admin', 'super_admin'].includes(m.role)).length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Shield className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" />
          <p className="text-lg text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Enhanced Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-3xl blur-3xl" />
          <div className="relative bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-xl blur-md" />
                    <div className="relative bg-gradient-to-br from-primary/10 to-accent/10 p-3 rounded-xl border border-primary/20">
                      <Shield className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white via-primary/90 to-accent">
                      Admin Control Center
                    </h1>
                    <p className="text-white/60 text-lg font-medium">
                      Studio Operations Dashboard
                    </p>
                  </div>
                </div>
              </div>
              <div className="hidden md:block">
                <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl p-4 border border-primary/20">
                  <div className="text-right">
                    <p className="text-sm text-white/60">Last updated</p>
                    <p className="text-white font-medium">{format(new Date(), 'MMM dd, HH:mm')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity" />
            <div className="relative bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 group-hover:border-white/20 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-white/60">Total Reports</p>
                  <p className="text-3xl font-bold text-white">{stats.totalReports}</p>
                  <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
                </div>
                <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-3 rounded-xl">
                  <FileText className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity" />
            <div className="relative bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 group-hover:border-white/20 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-white/60">Pending</p>
                  <p className="text-3xl font-bold text-white">{stats.pendingReports}</p>
                  <div className="w-12 h-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full" />
                </div>
                <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 p-3 rounded-xl">
                  <Clock className="h-6 w-6 text-yellow-400" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity" />
            <div className="relative bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 group-hover:border-white/20 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-white/60">In Progress</p>
                  <p className="text-3xl font-bold text-white">{stats.inProgressReports}</p>
                  <div className="w-12 h-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" />
                </div>
                <div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 p-3 rounded-xl">
                  <AlertTriangle className="h-6 w-6 text-cyan-400" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity" />
            <div className="relative bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 group-hover:border-white/20 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-white/60">Resolved</p>
                  <p className="text-3xl font-bold text-white">{stats.resolvedReports}</p>
                  <div className="w-12 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" />
                </div>
                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-3 rounded-xl">
                  <CheckCircle className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Main Content */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-accent/3 rounded-3xl" />
          <div className="relative">
            <Tabs defaultValue="reports" className="space-y-6">
              <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-2">
                <TabsList className="bg-transparent w-full grid grid-cols-2 gap-2">
                  <TabsTrigger 
                    value="reports" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/20 data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-primary/20 rounded-xl py-3 px-6 text-white/60 hover:text-white/80 transition-all duration-300"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Reports Management
                  </TabsTrigger>
                  <TabsTrigger 
                    value="members" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary/20 data-[state=active]:to-accent/20 data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-primary/20 rounded-xl py-3 px-6 text-white/60 hover:text-white/80 transition-all duration-300"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Members Overview
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="reports" className="space-y-6">
                {/* Enhanced Filters */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl blur-xl" />
                  <Card className="relative bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/3 via-transparent to-accent/3" />
                    <CardHeader className="relative">
                      <CardTitle className="text-xl text-white flex items-center gap-2">
                        <Filter className="h-5 w-5 text-primary" />
                        Filter Reports
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="relative">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="search" className="text-white/80">Search</Label>
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
                            <Input
                              id="search"
                              placeholder="Search by subject, description, or email..."
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                              className="pl-10 bg-black/30 backdrop-blur-sm border-white/20 text-white placeholder-white/40 focus:border-primary/50 focus:ring-primary/20"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white/80">Status</Label>
                          <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="bg-black/30 backdrop-blur-sm border-white/20 text-white focus:border-primary/50 focus:ring-primary/20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-black/90 backdrop-blur-xl border-white/20">
                              <SelectItem value="all" className="text-white hover:bg-white/10">All Status</SelectItem>
                              <SelectItem value="pending" className="text-yellow-400 hover:bg-yellow-500/10">Pending</SelectItem>
                              <SelectItem value="in_progress" className="text-blue-400 hover:bg-blue-500/10">In Progress</SelectItem>
                              <SelectItem value="resolved" className="text-green-400 hover:bg-green-500/10">Resolved</SelectItem>
                              <SelectItem value="closed" className="text-gray-400 hover:bg-gray-500/10">Closed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-white/80">Priority</Label>
                          <Select value={filterPriority} onValueChange={setFilterPriority}>
                            <SelectTrigger className="bg-black/30 backdrop-blur-sm border-white/20 text-white focus:border-primary/50 focus:ring-primary/20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-black/90 backdrop-blur-xl border-white/20">
                              <SelectItem value="all" className="text-white hover:bg-white/10">All Priority</SelectItem>
                              <SelectItem value="low" className="text-green-400 hover:bg-green-500/10">Low</SelectItem>
                              <SelectItem value="medium" className="text-yellow-400 hover:bg-yellow-500/10">Medium</SelectItem>
                              <SelectItem value="high" className="text-orange-400 hover:bg-orange-500/10">High</SelectItem>
                              <SelectItem value="urgent" className="text-red-400 hover:bg-red-500/10">Urgent</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Enhanced Reports List */}
                <div className="space-y-4">
                  {filteredReports.map((report) => (
                    <div key={report.id} className="group relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
                      <Card className="relative bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden group-hover:border-white/20 transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/2 via-transparent to-accent/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <CardContent className="relative p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-4">
                              <div className="flex items-center gap-3 flex-wrap">
                                <div className="flex items-center gap-2">
                                  <span className="text-2xl">{getTypeIcon(report.report_type)}</span>
                                  <h3 className="font-semibold text-xl text-white">{report.subject}</h3>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge className={`${getStatusColor(report.status)} border-0 font-medium`}>
                                    {report.status.replace('_', ' ').toUpperCase()}
                                  </Badge>
                                  <Badge className={`${getPriorityColor(report.priority)} border-0 font-medium`}>
                                    {report.priority.toUpperCase()}
                                  </Badge>
                                </div>
                              </div>
                              
                              <p className="text-white/70 text-base line-clamp-2 leading-relaxed">{report.description}</p>
                              
                              <div className="flex items-center gap-6 text-sm text-white/50">
                                <span className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-primary rounded-full" />
                                  {report.members.email}
                                </span>
                                <span className="flex items-center gap-2">
                                  <Calendar className="h-4 w-4" />
                                  {format(new Date(report.created_at), 'MMM dd, yyyy HH:mm')}
                                </span>
                                {report.report_files.length > 0 && (
                                  <span className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-accent rounded-full" />
                                    {report.report_files.length} file{report.report_files.length !== 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-3 ml-6">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedReport(report)
                                      setAdminNotes(report.admin_notes || "")
                                    }}
                                    className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20 text-white hover:from-primary/20 hover:to-accent/20 hover:border-primary/30 transition-all duration-300"
                                  >
                                    <Eye className="h-4 w-4 mr-2" />
                                    View Details
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-black/95 backdrop-blur-xl border-white/10">
                                  {selectedReport && (
                                    <>
                                      <DialogHeader>
                                        <DialogTitle className="flex items-center gap-3 text-2xl">
                                          <span className="text-3xl">{getTypeIcon(selectedReport.report_type)}</span>
                                          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">
                                            {selectedReport.subject}
                                          </span>
                                        </DialogTitle>
                                        <DialogDescription className="text-white/60 text-base">
                                          Report from {selectedReport.members.email} • {format(new Date(selectedReport.created_at), 'MMM dd, yyyy HH:mm')}
                                        </DialogDescription>
                                      </DialogHeader>
                                      
                                      <div className="space-y-6">
                                        <div className="flex gap-3 flex-wrap">
                                          <Badge className={`${getStatusColor(selectedReport.status)} border-0 font-medium text-sm px-3 py-1`}>
                                            {selectedReport.status.replace('_', ' ').toUpperCase()}
                                          </Badge>
                                          <Badge className={`${getPriorityColor(selectedReport.priority)} border-0 font-medium text-sm px-3 py-1`}>
                                            {selectedReport.priority.toUpperCase()}
                                          </Badge>
                                          <Badge className="bg-white/10 text-white/80 border-0 font-medium text-sm px-3 py-1">
                                            {selectedReport.report_type.replace('_', ' ').toUpperCase()}
                                          </Badge>
                                        </div>
                                        
                                        <div className="bg-black/30 rounded-xl p-4 border border-white/10">
                                          <h4 className="font-semibold mb-3 text-white flex items-center gap-2">
                                            <FileText className="h-4 w-4 text-primary" />
                                            Description
                                          </h4>
                                          <p className="text-white/80 whitespace-pre-wrap leading-relaxed">{selectedReport.description}</p>
                                        </div>
                                        
                                        {selectedReport.contact_info && (
                                          <div className="bg-black/30 rounded-xl p-4 border border-white/10">
                                            <h4 className="font-semibold mb-3 text-white flex items-center gap-2">
                                              <User className="h-4 w-4 text-accent" />
                                              Contact Information
                                            </h4>
                                            <p className="text-white/80">{selectedReport.contact_info}</p>
                                          </div>
                                        )}
                                        
                                        {selectedReport.report_files.length > 0 && (
                                          <div className="bg-black/30 rounded-xl p-4 border border-white/10">
                                            <h4 className="font-semibold mb-3 text-white flex items-center gap-2">
                                              📎 Attached Files
                                            </h4>
                                            <div className="space-y-3">
                                              {selectedReport.report_files.map((file) => (
                                                <div key={file.id} className="flex items-center justify-between p-3 bg-black/40 rounded-lg border border-white/5">
                                                  <div className="flex items-center gap-3">
                                                    <div className="w-2 h-2 bg-accent rounded-full" />
                                                    <span className="text-white">{file.file_name}</span>
                                                    <span className="text-sm text-white/50">
                                                      ({Math.round((file.file_size || 0) / 1024)} KB)
                                                    </span>
                                                  </div>
                                                  <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => window.open(file.file_url, '_blank')}
                                                    className="bg-black/20 border-white/20 text-white hover:bg-white/10"
                                                  >
                                                    <Download className="h-3 w-3 mr-2" />
                                                    View
                                                  </Button>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}
                                        
                                        <div className="bg-black/30 rounded-xl p-4 border border-white/10">
                                          <Label htmlFor="admin-notes" className="text-white font-semibold flex items-center gap-2 mb-3">
                                            <Edit className="h-4 w-4 text-primary" />
                                            Admin Notes
                                          </Label>
                                          <Textarea
                                            id="admin-notes"
                                            placeholder="Add your notes about this report..."
                                            value={adminNotes}
                                            onChange={(e) => setAdminNotes(e.target.value)}
                                            className="bg-black/40 border-white/20 text-white placeholder-white/40 focus:border-primary/50 focus:ring-primary/20 min-h-[100px]"
                                            rows={4}
                                          />
                                        </div>
                                        
                                        <div className="bg-black/30 rounded-xl p-4 border border-white/10">
                                          <Label className="text-white font-semibold flex items-center gap-2 mb-4">
                                            <Shield className="h-4 w-4 text-accent" />
                                            Update Status
                                          </Label>
                                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => updateReportStatus(selectedReport.id, 'pending', adminNotes)}
                                              className="bg-yellow-500/10 border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20"
                                              disabled={selectedReport.status === 'pending'}
                                            >
                                              <Clock className="h-4 w-4 mr-2" />
                                              Pending
                                            </Button>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => updateReportStatus(selectedReport.id, 'in_progress', adminNotes)}
                                              className="bg-blue-500/10 border-blue-500/30 text-blue-400 hover:bg-blue-500/20"
                                              disabled={selectedReport.status === 'in_progress'}
                                            >
                                              <AlertTriangle className="h-4 w-4 mr-2" />
                                              In Progress
                                            </Button>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => updateReportStatus(selectedReport.id, 'resolved', adminNotes)}
                                              className="bg-green-500/10 border-green-500/30 text-green-400 hover:bg-green-500/20"
                                              disabled={selectedReport.status === 'resolved'}
                                            >
                                              <CheckCircle className="h-4 w-4 mr-2" />
                                              Resolved
                                            </Button>
                                            <Button
                                              variant="outline"
                                              size="sm"
                                              onClick={() => updateReportStatus(selectedReport.id, 'closed', adminNotes)}
                                              className="bg-gray-500/10 border-gray-500/30 text-gray-400 hover:bg-gray-500/20"
                                              disabled={selectedReport.status === 'closed'}
                                            >
                                              <Trash2 className="h-4 w-4 mr-2" />
                                              Close
                                            </Button>
                                          </div>
                                        </div>
                                      </div>
                                    </>
                                  )}
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                  
                  {filteredReports.length === 0 && (
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl blur-xl" />
                      <div className="relative bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl p-12 text-center">
                        <div className="space-y-4">
                          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center">
                            <FileText className="h-8 w-8 text-white/60" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-white mb-2">No reports found</h3>
                            <p className="text-white/60">
                              {searchTerm || filterStatus !== 'all' || filterPriority !== 'all' 
                                ? 'Try adjusting your filters to see more results' 
                                : 'No reports have been submitted yet'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="members" className="space-y-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl blur-xl" />
                  <Card className="relative bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/3 via-transparent to-accent/3" />
                    <CardHeader className="relative">
                      <CardTitle className="text-xl text-white flex items-center gap-2">
                        <User className="h-5 w-5 text-accent" />
                        Members Overview
                      </CardTitle>
                      <CardDescription className="text-white/60 text-base">
                        Total: {stats.totalMembers} members • {stats.adminMembers} admin{stats.adminMembers !== 1 ? 's' : ''}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative">
                      <div className="space-y-4">
                        {members.map((member) => (
                          <div key={member.id} className="group relative">
                            <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg" />
                            <div className="relative flex items-center justify-between p-4 bg-black/30 rounded-xl border border-white/10 group-hover:border-white/20 transition-all duration-300">
                              <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                  <div className="w-3 h-3 bg-gradient-to-r from-primary to-accent rounded-full" />
                                  <span className="font-medium text-white text-lg">{member.email}</span>
                                  <Badge className={member.role === 'admin' || member.role === 'super_admin' 
                                    ? 'bg-gradient-to-r from-primary/20 to-accent/20 text-primary border-primary/30' 
                                    : 'bg-white/10 text-white/80 border-white/20'}>
                                    {member.role.replace('_', ' ').toUpperCase()}
                                  </Badge>
                                </div>
                                <div className="text-sm text-white/60 flex items-center gap-4">
                                  <span>Points: {member.monthly_points}/40</span>
                                  <span>Weekend slots: {member.weekend_slots_used}/6</span>
                                </div>
                                <div className="text-xs text-white/50">
                                  Member since: {format(new Date(member.created_at), 'MMM dd, yyyy')}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
