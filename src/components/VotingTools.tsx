import { useEffect, useState } from 'react'
import { Tool, ToolVoteCounts } from '../types/database.types'
import { supabase } from '../config/supabase'
import { voteService } from '../services/voteService'
import { ipUserService } from '../services/ipUserService'

export function VotingTools() {
  const [tools, setTools] = useState<Tool[]>([])
  const [voteCounts, setVoteCounts] = useState<Record<string, { upvotes: number; downvotes: number }>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [userVotes, setUserVotes] = useState<Record<string, 'up' | 'down' | null>>({})

  useEffect(() => {
    initializeUser()
    loadToolsAndVotes()

    // Subscribe to vote changes
    const channel = supabase
      .channel('vote-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'votes'
        },
        () => {
          loadToolsAndVotes()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const initializeUser = async () => {
    try {
      // Check localStorage first
      let currentUserId = ipUserService.getStoredUserId()

      if (!currentUserId) {
        // If no stored ID, create or find user based on IP
        currentUserId = await ipUserService.findOrCreateUser()
        ipUserService.storeUserId(currentUserId)
      }

      setUserId(currentUserId)
      await loadUserVotes(currentUserId)
    } catch (e) {
      console.error('Error initializing user:', e)
      setError('Error identifying user')
    }
  }

  const loadToolsAndVotes = async () => {
    try {
      // Fetch tools
      const { data: toolsData, error: toolsError } = await supabase
        .from('tools')
        .select('*')
        .order('name')
      
      if (toolsError) throw toolsError

      // Fetch vote counts
      const voteCounts = await voteService.getToolVoteCounts()
      
      // Transform vote counts into a map
      const voteCountsMap = voteCounts.reduce((acc, count) => ({
        ...acc,
        [count.tool_id]: {
          upvotes: count.upvotes,
          downvotes: count.downvotes
        }
      }), {})

      setTools(toolsData || [])
      setVoteCounts(voteCountsMap)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const loadUserVotes = async (uid: string) => {
    try {
      const { data: votes, error } = await supabase
        .from('votes')
        .select('tool_id, vote_type')
        .eq('user_id', uid)

      if (error) throw error

      const userVotesMap = (votes || []).reduce((acc, vote) => ({
        ...acc,
        [vote.tool_id]: vote.vote_type
      }), {})

      setUserVotes(userVotesMap)
    } catch (e) {
      console.error('Error loading user votes:', e)
    }
  }

  const handleVote = async (toolId: string, voteType: 'up' | 'down') => {
    if (!userId) {
      setError('Error identifying user')
      return
    }

    try {
      await voteService.voteForTool(userId, toolId, voteType)
      // Vote counts will be updated via subscription
      await loadUserVotes(userId)
    } catch (e) {
      console.error('Error voting:', e)
      setError('Error submitting vote')
    }
  }

  if (loading) return <div className="text-center py-8">Loading...</div>
  if (error) return <div className="text-center py-8 text-red-600">Error: {error}</div>
  if (tools.length === 0) return <div className="text-center py-8">No tools found</div>

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tools.map(tool => {
          const votes = voteCounts[tool.id] || { upvotes: 0, downvotes: 0 }
          const userVote = userVotes[tool.id]

          return (
            <div key={tool.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center gap-4">
                {tool.logo && (
                  <img 
                    src={tool.logo} 
                    alt={`${tool.name} logo`} 
                    className="w-12 h-12 object-contain rounded-md"
                  />
                )}
                <div>
                  <h3 className="font-semibold text-lg">{tool.name}</h3>
                  <p className="text-sm text-gray-600">{tool.description}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-4">
                <button
                  onClick={() => handleVote(tool.id, 'up')}
                  className={`flex items-center gap-1 px-3 py-1 rounded ${
                    userVote === 'up' 
                      ? 'bg-green-100 text-green-700' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  👍 {votes.upvotes}
                </button>
                <button
                  onClick={() => handleVote(tool.id, 'down')}
                  className={`flex items-center gap-1 px-3 py-1 rounded ${
                    userVote === 'down' 
                      ? 'bg-red-100 text-red-700' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  👎 {votes.downvotes}
                </button>
                {tool.url && (
                  <a
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto text-blue-500 hover:text-blue-700 text-sm"
                  >
                    Visit →
                  </a>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
} 