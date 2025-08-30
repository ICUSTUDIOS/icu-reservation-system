"use client"

import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase/client"

interface ClientSignOutButtonProps {
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  children: React.ReactNode
}

export default function ClientSignOutButton({ 
  variant = "outline", 
  size = "default",
  className = "",
  children 
}: ClientSignOutButtonProps) {  const handleSignOut = async () => {
    try {
      // First, sign out from Supabase with proper scope
      await supabase.auth.signOut({ scope: 'global' })
      
      // Clear any local storage or session storage
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
        
        // Also clear any IndexedDB data that Supabase might use
        if ('indexedDB' in window) {
          try {
            const databases = await indexedDB.databases()
            await Promise.all(
              databases.map(db => {
                if (db.name?.includes('supabase') || db.name?.includes('auth')) {
                  return new Promise<void>((resolve) => {
                    const deleteRequest = indexedDB.deleteDatabase(db.name!)
                    deleteRequest.onsuccess = () => resolve()
                    deleteRequest.onerror = () => resolve() // Continue even if deletion fails
                  })
                }
                return Promise.resolve()
              })
            )
          } catch (e) {
            console.log('IndexedDB cleanup failed:', e)
          }
        }
      }
      
      // Force a complete page refresh to ensure all state is cleared
      window.location.replace("/")
    } catch (error) {
      console.error("Error signing out:", error)
      // Even if there's an error, force a refresh to clear state
      window.location.replace("/")
    }
  }
  return (
    <Button 
      variant={variant} 
      size={size}
      className={className}
      onClick={handleSignOut}
    >
      {children}
    </Button>
  )
}
