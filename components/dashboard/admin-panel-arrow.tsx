'use client'

import { Shield } from "lucide-react"
import Link from "next/link"

interface AdminPanelArrowProps {
  isAdmin: boolean
}

export default function AdminPanelArrow({ isAdmin }: AdminPanelArrowProps) {
  if (!isAdmin) return null

  return (
    <div 
      className="absolute left-1/2 transform -translate-x-1/2 group cursor-pointer z-10"
      style={{ top: '100%', marginTop: '-1px' }}
    >
      {/* Arrow pointing down */}
      <div className="relative">
        {/* Main arrow body - half height, extends down from header bottom */}
        <div 
          className="w-28 h-8 bg-gradient-to-b from-amber-400 via-amber-500 to-yellow-600 shadow-lg border border-amber-300/50 transition-all duration-300 group-hover:h-10 group-hover:shadow-xl flex items-center justify-center relative"
          style={{
            clipPath: 'polygon(25% 0%, 75% 0%, 100% 60%, 50% 100%, 0% 60%)',
            boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
          }}
        >
          {/* Shield icon in the arrow - centered and bigger, slightly thinner */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Shield className="h-5 w-5 text-black transition-all duration-300 group-hover:h-6 group-hover:w-6" strokeWidth={2.2} />
          </div>
          
          {/* Shine effect */}
          <div 
            className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent"
            style={{ clipPath: 'polygon(25% 0%, 75% 0%, 100% 60%, 50% 100%, 0% 60%)' }}
          />
        </div>
        
        {/* Admin Panel Button - appears on hover as reversed arrow */}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
          <Link href="/admin">
            <div 
              className="w-28 h-8 bg-gradient-to-t from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 shadow-lg hover:shadow-xl transition-all duration-200 border border-amber-300/50 flex items-center justify-center relative cursor-pointer"
              style={{
                clipPath: 'polygon(25% 100%, 75% 100%, 100% 40%, 50% 0%, 0% 40%)',
                boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
              }}
            >
              {/* Admin Panel text */}
              <span className="text-xs font-semibold text-black">Admin Panel</span>
              
              {/* Shine effect */}
              <div 
                className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent"
                style={{ clipPath: 'polygon(25% 100%, 75% 100%, 100% 40%, 50% 0%, 0% 40%)' }}
              />
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
