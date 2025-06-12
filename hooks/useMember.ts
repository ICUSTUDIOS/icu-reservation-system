import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Member {
  id: string
  user_id: string
  email: string
  full_name: string
  role: string
  points: number
  status: string
}

export function useMember(userId: string | undefined) {
  const [member, setMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const supabase = createClient()
    
    const fetchMember = async () => {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('user_id', userId)
        .single()
      
      if (error) {
        console.error('Error fetching member:', error)
      } else {
        setMember(data)
      }
      setLoading(false)
    }

    fetchMember()
  }, [userId])

  return { member, loading, refetch: () => setLoading(true) }
}
