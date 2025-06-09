import { useEffect, useState } from 'react'
import { supabase } from '../config/supabase'
import { ipUserService } from '../services/ipUserService'

export function VoteDebug() {
  const [currentIp, setCurrentIp] = useState<string>('')
  const [userId, setUserId] = useState<string>('')
  const [recentVotes, setRecentVotes] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDebugInfo()
    subscribeToVotes()
  }, [])

  const loadDebugInfo = async () => {
    try {
      // Get current IP
      const ip = await ipUserService.getCurrentIp()
      setCurrentIp(ip)

      // Get stored user ID
      const storedId = ipUserService.getStoredUserId()
      if (storedId) {
        setUserId(storedId)
      }

      // Load recent votes
      const { data, error } = await supabase
        .from('votes')
        .select(`
          *,
          users (
            name,
            ip_address
          ),
          tools (
            name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setRecentVotes(data || [])
    } catch (e) {
      console.error('Debug info error:', e)
      setError(e instanceof Error ? e.message : 'Error loading debug info')
    }
  }

  const subscribeToVotes = () => {
    const channel = supabase
      .channel('vote-debug')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'votes'
        },
        () => {
          loadDebugInfo() // Reload data when votes change
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  return (
    <div className="mt-8 p-4 bg-gray-50 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Debug Information</h2>
      
      {error ? (
        <div className="text-red-600 mb-4">Error: {error}</div>
      ) : (
        <>
          <div className="mb-4">
            <p><strong>Current IP:</strong> {currentIp}</p>
            <p><strong>User ID:</strong> {userId}</p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Recent Votes (Last 10)</h3>
            <div className="space-y-2">
              {recentVotes.map(vote => (
                <div key={vote.id} className="p-2 bg-white rounded border">
                  <p>
                    <strong>Tool:</strong> {vote.tools?.name}
                  </p>
                  <p>
                    <strong>Vote:</strong> {vote.vote_type === 'up' ? '👍' : '👎'}
                  </p>
                  <p>
                    <strong>User:</strong> {vote.users?.name}
                  </p>
                  <p>
                    <strong>IP:</strong> {vote.users?.ip_address}
                  </p>
                  <p>
                    <strong>Time:</strong> {new Date(vote.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
} 