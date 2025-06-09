import { useEffect, useState } from 'react'
import { supabase } from '../config/supabase'

export function SupabaseExample() {
  const [data, setData] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch data from the 'tools' table. Change to 'users' or 'votes' if needed.
        const { data, error } = await supabase
          .from('tools')
          .select('*')
        
        if (error) throw error
        
        setData(data || [])
      } catch (e) {
        setError(e instanceof Error ? e.message : 'An error occurred')
      }
    }

    fetchData()
  }, [])

  if (error) return <div>Error: {error}</div>
  
  return (
    <div>
      <h2>Data from Supabase</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}