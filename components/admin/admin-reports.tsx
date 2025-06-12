"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"

interface Report {
  id: string
  user_id: string
  subject: string
  description: string
  status: string
  created_at: string
  members?: {
    full_name: string
    email: string
  }
}

interface AdminReportsProps {
  reports: Report[]
}

export default function AdminReports({ reports }: AdminReportsProps) {
  const [processing, setProcessing] = useState<string | null>(null)

  const handleResolveReport = async (reportId: string) => {
    setProcessing(reportId)
    // TODO: Implement report resolution
    console.log(`Resolving report ${reportId}`)
    setProcessing(null)
  }

  const handleDismissReport = async (reportId: string) => {
    setProcessing(reportId)
    // TODO: Implement report dismissal
    console.log(`Dismissing report ${reportId}`)
    setProcessing(null)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary'
      case 'resolved':
        return 'default'
      case 'dismissed':
        return 'outline'
      default:
        return 'outline'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Member Reports</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {reports.length === 0 ? (
            <p className="text-muted-foreground">No reports found.</p>
          ) : (
            reports.map((report) => (
              <div key={report.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{report.subject}</div>
                    <div className="text-sm text-muted-foreground">
                      From: {report.members?.full_name} ({report.members?.email})
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusColor(report.status)}>
                      {report.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(report.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                <div className="text-sm">
                  <p>{report.description}</p>
                </div>
                
                {report.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleResolveReport(report.id)}
                      disabled={processing === report.id}
                    >
                      {processing === report.id ? 'Processing...' : 'Resolve'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDismissReport(report.id)}
                      disabled={processing === report.id}
                    >
                      {processing === report.id ? 'Processing...' : 'Dismiss'}
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
