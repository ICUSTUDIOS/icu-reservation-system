"use client"

import { Shield } from "lucide-react"

export default function SimpleAdminDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-background/90">
      <div className="container mx-auto px-6 py-8 space-y-8">
        {/* Header */}
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
            </div>
          </div>
        </div>

        {/* Simple Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity" />
            <div className="relative bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl p-6 group-hover:border-white/20 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-white/60">Total Reports</p>
                  <p className="text-3xl font-bold text-white">0</p>
                  <div className="w-12 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
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
                  <p className="text-3xl font-bold text-white">0</p>
                  <div className="w-12 h-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full" />
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
                  <p className="text-3xl font-bold text-white">0</p>
                  <div className="w-12 h-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" />
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
                  <p className="text-3xl font-bold text-white">0</p>
                  <div className="w-12 h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Simple Content */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-accent/3 rounded-3xl" />
          <div className="relative bg-black/50 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-white">Admin Dashboard</h2>
              <p className="text-white/60">Welcome to the admin control center. The full dashboard is loading...</p>
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary/20 to-accent/20 rounded-2xl flex items-center justify-center">
                <Shield className="h-8 w-8 text-white/60" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
