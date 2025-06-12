import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'

interface Booking {
  id: string
  user_id: string
  start_time: string
  end_time: string
  status: string
  created_at: string
}

export function useBookings(userId: string | undefined) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {    if (!userId) {
      setLoading(false)
      return
    }

    const fetchBookings = async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', userId)
        .order('start_time', { ascending: true })
      
      if (error) {
        console.error('Error fetching bookings:', error)
      } else {
        setBookings(data || [])
      }
      setLoading(false)
    }

    fetchBookings()

    // Subscribe to booking changes
    const subscription = supabase
      .channel('user-bookings')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'bookings',
          filter: `user_id=eq.${userId}`
        }, 
        () => {
          fetchBookings()
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [userId])

  return { bookings, loading, refetch: () => setLoading(true) }
}
