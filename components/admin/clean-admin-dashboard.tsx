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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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
    
    try {
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
    } catch (error) {
      console.error('Fetch data error:', error)
      toast.error('Failed to load admin data')
    } finally {
      setLoading(false)
    }
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
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent flex items-center gap-2">
            <Shield className="h-8 w-8 text-primary" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">Manage reports and studio operations</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Reports</p>
              <p className="text-2xl font-bold text-primary">{stats.totalReports}</p>
            </div>
            <FileText className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-yellow-400">{stats.pendingReports}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-400" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold text-blue-400">{stats.inProgressReports}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-blue-400" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Resolved</p>
              <p className="text-2xl font-bold text-green-400">{stats.resolvedReports}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-end gap-4">
                <div className="flex-1">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by subject, description, or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Priority</Label>
                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priority</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reports List */}
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <Card key={report.id} className="hover:bg-accent/10 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{getTypeIcon(report.report_type)}</span>
                        <h3 className="font-semibold text-lg">{report.subject}</h3>
                        <Badge className={getStatusColor(report.status)}>
                          {report.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={getPriorityColor(report.priority)}>
                          {report.priority}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground line-clamp-2">{report.description}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {report.members.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(report.created_at), 'MMM dd, yyyy HH:mm')}
                        </span>
                        {report.report_files.length > 0 && (
                          <span className="flex items-center gap-1">
                            📎 {report.report_files.length} file{report.report_files.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedReport(report)
                              setAdminNotes(report.admin_notes || "")
                            }}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          {selectedReport && (
                            <>
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <span className="text-xl">{getTypeIcon(selectedReport.report_type)}</span>
                                  {selectedReport.subject}
                                </DialogTitle>
                                <DialogDescription>
                                  Report from {selectedReport.members.email} • {format(new Date(selectedReport.created_at), 'MMM dd, yyyy HH:mm')}
                                </DialogDescription>
                              </DialogHeader>
                              
                              <div className="space-y-4">
                                <div className="flex gap-2">
                                  <Badge className={getStatusColor(selectedReport.status)}>
                                    {selectedReport.status.replace('_', ' ')}
                                  </Badge>
                                  <Badge className={getPriorityColor(selectedReport.priority)}>
                                    {selectedReport.priority}
                                  </Badge>
                                  <Badge variant="outline">
                                    {selectedReport.report_type}
                                  </Badge>
                                </div>
                                
                                <div>
                                  <h4 className="font-semibold mb-2">Description</h4>
                                  <p className="text-muted-foreground whitespace-pre-wrap">{selectedReport.description}</p>
                                </div>
                                
                                {selectedReport.contact_info && (
                                  <div>
                                    <h4 className="font-semibold mb-2">Contact Info</h4>
                                    <p className="text-muted-foreground">{selectedReport.contact_info}</p>
                                  </div>
                                )}
                                
                                {selectedReport.report_files.length > 0 && (
                                  <div>
                                    <h4 className="font-semibold mb-2">Attached Files</h4>
                                    <div className="space-y-2">
                                      {selectedReport.report_files.map((file) => (
                                        <div key={file.id} className="flex items-center justify-between p-2 bg-muted rounded border">
                                          <div className="flex items-center gap-2">
                                            <span>📎</span>
                                            <span>{file.file_name}</span>
                                            <span className="text-sm text-muted-foreground">
                                              ({Math.round((file.file_size || 0) / 1024)} KB)
                                            </span>
                                          </div>
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => window.open(file.file_url, '_blank')}
                                          >
                                            <Download className="h-3 w-3 mr-1" />
                                            View
                                          </Button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                <div>
                                  <Label htmlFor="admin-notes">Admin Notes</Label>
                                  <Textarea
                                    id="admin-notes"
                                    placeholder="Add your notes about this report..."
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    className="mt-1"
                                    rows={3}
                                  />
                                </div>
                                
                                <div>
                                  <Label>Update Status</Label>
                                  <div className="flex gap-2 mt-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => updateReportStatus(selectedReport.id, 'pending', adminNotes)}
                                      className="bg-yellow-500/10 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/20"
                                      disabled={selectedReport.status === 'pending'}
                                    >
                                      Mark Pending
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => updateReportStatus(selectedReport.id, 'in_progress', adminNotes)}
                                      className="bg-blue-500/10 border-blue-500/50 text-blue-400 hover:bg-blue-500/20"
                                      disabled={selectedReport.status === 'in_progress'}
                                    >
                                      Mark In Progress
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => updateReportStatus(selectedReport.id, 'resolved', adminNotes)}
                                      className="bg-green-500/10 border-green-500/50 text-green-400 hover:bg-green-500/20"
                                      disabled={selectedReport.status === 'resolved'}
                                    >
                                      Mark Resolved
                                    </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => updateReportStatus(selectedReport.id, 'closed', adminNotes)}
                                      className="bg-gray-500/10 border-gray-500/50 text-gray-400 hover:bg-gray-500/20"
                                      disabled={selectedReport.status === 'closed'}
                                    >
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
            ))}
            
            {filteredReports.length === 0 && (
              <Card>
                <CardContent className="p-6 text-center">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <h3 className="text-base font-medium mb-1">No reports found</h3>
                  <p className="text-sm text-muted-foreground">
                    {searchTerm || filterStatus !== 'all' || filterPriority !== 'all' 
                      ? 'Try adjusting your filters' 
                      : 'No reports have been submitted yet'}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Members Overview</CardTitle>
              <CardDescription>
                Total: {stats.totalMembers} members • {stats.adminMembers} admin{stats.adminMembers !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {members.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 bg-muted/30 rounded border">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{member.email}</span>
                        <Badge variant={member.role === 'admin' || member.role === 'super_admin' ? 'default' : 'secondary'}>
                          {member.role}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Points: {member.monthly_points}/40 • Weekend slots: {member.weekend_slots_used}/12
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Joined: {format(new Date(member.created_at), 'MMM dd, yyyy')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
