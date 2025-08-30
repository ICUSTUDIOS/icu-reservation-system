"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UserPlus, Mail, Users, Sparkles, X, Clock, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { inviteUser, getPendingInvitations, revokeInvitation } from "@/lib/invite-user-actions"

interface InviteUserFormData {
  email: string
  role: 'member' | 'admin'
  defaultPoints: number
}

interface PendingInvitation {
  id: string
  email: string
  invited_at: string
  role: string
  default_points: number
}

export default function AdminInviteUser() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([])
  const [loadingInvitations, setLoadingInvitations] = useState(true)
  const [revokingId, setRevokingId] = useState<string | null>(null)
  const [formData, setFormData] = useState<InviteUserFormData>({
    email: '',
    role: 'member',
    defaultPoints: 40
  })

  useEffect(() => {
    loadPendingInvitations()
  }, [])

  const loadPendingInvitations = async () => {
    setLoadingInvitations(true)
    try {
      const result = await getPendingInvitations()
      if (result.error) {
        console.error('Error loading invitations:', result.error)
      } else {
        setPendingInvitations(result.data || [])
      }
    } catch (error) {
      console.error('Error loading invitations:', error)
    } finally {
      setLoadingInvitations(false)
    }
  }

  const handleRevoke = async (userId: string, email: string) => {
    if (!confirm(`Are you sure you want to revoke the invitation for ${email}?`)) {
      return
    }

    setRevokingId(userId)
    try {
      const result = await revokeInvitation(userId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(result.message)
        loadPendingInvitations() // Refresh the list
      }
    } catch (error) {
      toast.error('Failed to revoke invitation')
    } finally {
      setRevokingId(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {      const result = await inviteUser({
        email: formData.email,
        role: formData.role,
        defaultPoints: formData.defaultPoints
      })

      if (result.error) {
        // Show more helpful error message for admin configuration issues
        if (result.error.includes('Admin operations not configured')) {
          toast.error('System Error: Service role key not configured. Please contact system administrator.')
        } else {
          toast.error(result.error)
        }
        return
      }

      if (result.success) {
        toast.success(result.message)
        
        // Reset form and close dialog
        setFormData({
          email: '',
          role: 'member',
          defaultPoints: 40
        })
        setIsOpen(false)
        
        // Refresh pending invitations list
        loadPendingInvitations()
      }

    } catch (error) {
      console.error('Unexpected error:', error)
      toast.error('Failed to send invitation. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div className="space-y-6">
      {/* Invite User Button */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
            <UserPlus className="h-4 w-4 mr-2" />
            Invite New User
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-md bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Mail className="h-5 w-5 text-blue-400" />
              Invite New User
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                required
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-gray-300">
                User Role
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as 'member' | 'admin' }))}
              >
                <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="member" className="text-white hover:bg-gray-700">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-400" />
                      Member
                    </div>
                  </SelectItem>
                  <SelectItem value="admin" className="text-white hover:bg-gray-700">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-red-400" />
                      Admin
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="points" className="text-gray-300">
                Default Points
              </Label>
              <Input
                id="points"
                type="number"
                min="0"
                max="1000"
                value={formData.defaultPoints}
                onChange={(e) => setFormData(prev => ({ ...prev, defaultPoints: parseInt(e.target.value) || 0 }))}
                className="bg-gray-800 border-gray-600 text-white"
              />
              <p className="text-sm text-gray-400 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Points the user will start with
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading || !formData.email}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Invitation
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Pending Invitations */}
      <Card className="bg-white/5 border-white/10">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-400" />
            Pending Invitations ({pendingInvitations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingInvitations ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-400"></div>
              <span className="ml-2 text-gray-400">Loading invitations...</span>
            </div>
          ) : pendingInvitations.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No pending invitations</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingInvitations.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                >
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-blue-400" />
                    <div>
                      <p className="text-white font-medium">{invitation.email}</p>
                      <div className="flex items-center gap-3 text-sm text-gray-400">
                        <Badge variant="outline" className="text-gray-300">
                          {invitation.role}
                        </Badge>
                        <span>{invitation.default_points} points</span>
                        <span>
                          Sent {new Date(invitation.invited_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRevoke(invitation.id, invitation.email)}
                    disabled={revokingId === invitation.id}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {revokingId === invitation.id ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                        Revoking...
                      </>
                    ) : (
                      <>
                        <Trash2 className="h-3 w-3 mr-1" />
                        Revoke
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
