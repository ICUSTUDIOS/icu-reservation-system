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
  Trash2,
  Loader2
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
  members?: {
    email: string
  }
  report_files?: {
    id: string
    file_name: string
    file_size: number
    file_type: string
    file_url: string
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

export default function FixedAdminDashboard() {
  const [reports, setReports] = useState<Report[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReport, setSelectedReport] = useState<Report | null>(null)
  const [adminNotes, setAdminNotes] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterPriority, setFilterPriority] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    
    try {
      // First, try to fetch reports without joins to see if the basic query works
      console.log('Fetching reports...')
      const { data: reportsData, error: reportsError } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false })

      if (reportsError) {
        console.error('Reports error:', reportsError)
        toast.error(`Failed to fetch reports: ${reportsError.message}`)
      } else {
        console.log('Reports fetched successfully:', reportsData?.length || 0)
        setReports(reportsData || [])
      }

      // Fetch members
      console.log('Fetching members...')
      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select('*')
        .order('created_at', { ascending: false })

      if (membersError) {
        console.error('Members error:', membersError)
        toast.error(`Failed to fetch members: ${membersError.message}`)
      } else {
        console.log('Members fetched successfully:', membersData?.length || 0)
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
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString()
      }

      if (notes) {
        updateData.admin_notes = notes
      }

      if (status === 'resolved') {
        updateData.resolved_at = new Date().toISOString()
        // Get current user (admin) email for resolved_by
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          updateData.resolved_by = user.email
        }
      }

      const { error } = await supabase
        .from('reports')
        .update(updateData)
        .eq('id', reportId)

      if (error) {
        console.error('Update error:', error)
        toast.error(`Failed to update report: ${error.message}`)
      } else {
        toast.success('Report updated successfully')
        fetchData() // Refresh the data
        setSelectedReport(null)
        setAdminNotes("")
      }
    } catch (error) {
      console.error('Update report error:', error)
      toast.error('Failed to update report')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: "bg-yellow-500", icon: Clock },
      in_progress: { color: "bg-blue-500", icon: Edit },
      resolved: { color: "bg-green-500", icon: CheckCircle },
      closed: { color: "bg-gray-500", icon: FileText }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon
    
    return (
      <Badge className={`${config.color} text-white`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      low: "bg-gray-500",
      medium: "bg-yellow-500",
      high: "bg-orange-500",
      urgent: "bg-red-500"
    }
    
    return (
      <Badge className={`${priorityConfig[priority as keyof typeof priorityConfig]} text-white`}>
        {priority.toUpperCase()}
      </Badge>
    )
  }

  const filteredReports = reports.filter(report => {
    const matchesStatus = filterStatus === "all" || report.status === filterStatus
    const matchesPriority = filterPriority === "all" || report.priority === filterPriority
    const matchesSearch = searchTerm === "" || 
      report.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesStatus && matchesPriority && matchesSearch
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-yellow-400" />
            <p>Loading Admin Dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-yellow-400" />
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">Total Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{reports.length}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-400">
                {reports.filter(r => r.status === 'pending').length}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">
                {reports.filter(r => r.status === 'in_progress').length}
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-gray-400">Total Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">{members.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="reports" className="space-y-6">
          <TabsList className="bg-gray-800">
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
          </TabsList>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            {/* Filters */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Label className="text-gray-300">Status:</Label>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32 bg-gray-700 border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center gap-2">
                  <Label className="text-gray-300">Priority:</Label>
                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger className="w-32 bg-gray-700 border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Label className="text-gray-300">Search:</Label>
                  <div className="relative flex-1 max-w-md">
                    <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      placeholder="Search reports..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reports Table */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Reports ({filteredReports.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredReports.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No reports found matching your criteria.</p>
                    </div>
                  ) : (
                    filteredReports.map((report) => (
                      <Card key={report.id} className="bg-gray-700/30 border-gray-600 hover:bg-gray-700/50 transition-colors">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-white truncate">{report.subject}</h3>
                                {getStatusBadge(report.status)}
                                {getPriorityBadge(report.priority)}
                              </div>
                              <p className="text-gray-300 text-sm mb-2 line-clamp-2">{report.description}</p>
                              <div className="flex items-center gap-4 text-xs text-gray-400">
                                <span className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {report.members?.email || 'Unknown User'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {format(new Date(report.created_at), 'MMM dd, yyyy')}
                                </span>
                                <span className="capitalize">{report.report_type}</span>
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
                                    className="border-gray-600 hover:bg-gray-600"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl bg-gray-800 border-gray-600">
                                  <DialogHeader>
                                    <DialogTitle className="text-white">Report Details</DialogTitle>
                                    <DialogDescription className="text-gray-300">
                                      Manage and update this report
                                    </DialogDescription>
                                  </DialogHeader>
                                  
                                  {selectedReport && (
                                    <div className="space-y-4 text-white">
                                      <div>
                                        <Label className="text-gray-300">Subject</Label>
                                        <p className="font-semibold">{selectedReport.subject}</p>
                                      </div>
                                      
                                      <div>
                                        <Label className="text-gray-300">Description</Label>
                                        <p className="text-gray-300">{selectedReport.description}</p>
                                      </div>
                                      
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <Label className="text-gray-300">Status</Label>
                                          <div className="mt-1">{getStatusBadge(selectedReport.status)}</div>
                                        </div>
                                        <div>
                                          <Label className="text-gray-300">Priority</Label>
                                          <div className="mt-1">{getPriorityBadge(selectedReport.priority)}</div>
                                        </div>
                                      </div>
                                      
                                      <div>
                                        <Label className="text-gray-300">Contact Info</Label>
                                        <p className="text-gray-300">{selectedReport.contact_info || 'Not provided'}</p>
                                      </div>
                                      
                                      <div>
                                        <Label htmlFor="admin-notes" className="text-gray-300">Admin Notes</Label>
                                        <Textarea
                                          id="admin-notes"
                                          value={adminNotes}
                                          onChange={(e) => setAdminNotes(e.target.value)}
                                          placeholder="Add admin notes..."
                                          className="bg-gray-700 border-gray-600 text-white mt-1"
                                          rows={3}
                                        />
                                      </div>
                                      
                                      <div>
                                        <Label className="text-gray-300">Update Status</Label>
                                        <div className="flex gap-2 mt-2">
                                          <Button
                                            size="sm"
                                            onClick={() => updateReportStatus(selectedReport.id, 'in_progress', adminNotes)}
                                            className="bg-blue-600 hover:bg-blue-700"
                                          >
                                            Mark In Progress
                                          </Button>
                                          <Button
                                            size="sm"
                                            onClick={() => updateReportStatus(selectedReport.id, 'resolved', adminNotes)}
                                            className="bg-green-600 hover:bg-green-700"
                                          >
                                            Mark Resolved
                                          </Button>
                                          <Button
                                            size="sm"
                                            onClick={() => updateReportStatus(selectedReport.id, 'closed', adminNotes)}
                                            className="bg-gray-600 hover:bg-gray-700"
                                          >
                                            Close Report
                                          </Button>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Members Tab */}
          <TabsContent value="members" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Members ({members.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {members.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No members found.</p>
                    </div>
                  ) : (
                    members.map((member) => (
                      <Card key={member.id} className="bg-gray-700/30 border-gray-600">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-semibold text-white">{member.email}</h3>
                              <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                                <span>Role: {member.role}</span>
                                <span>Points: {member.monthly_points}</span>
                                <span>Weekend Slots: {member.weekend_slots_used}</span>
                                <span>Joined: {format(new Date(member.created_at), 'MMM dd, yyyy')}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
