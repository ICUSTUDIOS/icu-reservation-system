"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface Member {
  id: string
  email: string
  full_name: string
  role: string
  points: number
  status: string
  created_at: string
}

interface AdminUserManagementProps {
  members: Member[]
}

export default function AdminUserManagement({ members }: AdminUserManagementProps) {
  const handleRoleChange = async (memberId: string, newRole: string) => {
    // TODO: Implement role change functionality
    console.log(`Changing role for member ${memberId} to ${newRole}`)
  }

  const handleSuspendUser = async (memberId: string) => {
    // TODO: Implement user suspension functionality
    console.log(`Suspending user ${memberId}`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {members.length === 0 ? (
            <p className="text-muted-foreground">No members found.</p>
          ) : (
            members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{member.full_name}</div>
                  <div className="text-sm text-muted-foreground">{member.email}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                      {member.role}
                    </Badge>
                    <Badge variant="outline">
                      {member.points} points
                    </Badge>
                    <Badge variant={member.status === 'active' ? 'default' : 'destructive'}>
                      {member.status}
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRoleChange(member.id, member.role === 'admin' ? 'member' : 'admin')}
                  >
                    {member.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleSuspendUser(member.id)}
                    disabled={member.status === 'suspended'}
                  >
                    Suspend
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
