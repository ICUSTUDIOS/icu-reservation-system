"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AdminStatsProps {
  totalMembers?: number
  pendingApplications?: number
  activeBookings?: number
  monthlyRevenue?: number
}

export default function AdminStats({
  totalMembers = 0,
  pendingApplications = 0,
  activeBookings = 0,
  monthlyRevenue = 0,
}: AdminStatsProps) {
  const stats = [
    {
      title: "Total Members",
      value: totalMembers,
      description: "Active studio members",
    },
    {
      title: "Pending Applications",
      value: pendingApplications,
      description: "Applications awaiting review",
    },
    {
      title: "Active Bookings",
      value: activeBookings,
      description: "Bookings for today",
    },
    {
      title: "Monthly Revenue",
      value: `$${monthlyRevenue}`,
      description: "Revenue this month",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
