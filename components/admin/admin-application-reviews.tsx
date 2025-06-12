"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"

interface Application {
  id: string
  email: string
  full_name: string
  experience_level: string
  collaboration_interest: string
  additional_info: string
  status: string
  created_at: string
}

interface AdminApplicationReviewsProps {
  applications: Application[]
}

export default function AdminApplicationReviews({ applications }: AdminApplicationReviewsProps) {
  const [processing, setProcessing] = useState<string | null>(null)

  const handleApproveApplication = async (applicationId: string) => {
    setProcessing(applicationId)
    // TODO: Implement application approval
    console.log(`Approving application ${applicationId}`)
    setProcessing(null)
  }

  const handleRejectApplication = async (applicationId: string) => {
    setProcessing(applicationId)
    // TODO: Implement application rejection
    console.log(`Rejecting application ${applicationId}`)
    setProcessing(null)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Applications</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {applications.length === 0 ? (
            <p className="text-muted-foreground">No pending applications.</p>
          ) : (
            applications.map((application) => (
              <div key={application.id} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{application.full_name}</div>
                    <div className="text-sm text-muted-foreground">{application.email}</div>
                  </div>
                  <Badge variant="outline">
                    {new Date(application.created_at).toLocaleDateString()}
                  </Badge>
                </div>
                
                <div className="text-sm space-y-2">
                  <div>
                    <span className="font-medium">Experience Level:</span> {application.experience_level}
                  </div>
                  <div>
                    <span className="font-medium">Collaboration Interest:</span> {application.collaboration_interest}
                  </div>
                  {application.additional_info && (
                    <div>
                      <span className="font-medium">Additional Info:</span> {application.additional_info}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleApproveApplication(application.id)}
                    disabled={processing === application.id}
                  >
                    {processing === application.id ? 'Processing...' : 'Approve'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRejectApplication(application.id)}
                    disabled={processing === application.id}
                  >
                    {processing === application.id ? 'Processing...' : 'Reject'}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
