import { useEffect, useState } from 'react'
import { Tool } from '../types/database.types'
import { supabase } from '../config/supabase'
import { voteService } from '../services/voteService'

export function ToolsList() {
  const [tools, setTools] = useState<Tool[]>([])
  const [voteCounts, setVoteCounts] = useState<Record<string, { upvotes: number; downvotes: number }>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch tools
        const { data: toolsData, error: toolsError } = await supabase
          .from('tools')
          .select('*')
        
        if (toolsError) throw toolsError
        
        // Fetch vote counts
        const voteCounts = await voteService.getToolVoteCounts()
        
        // Transform vote counts into a more convenient format
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

    loadData()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (tools.length === 0) return <div>No tools found</div>

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Tools</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tools.map(tool => (
          <div key={tool.id} className="p-4 border rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              {tool.logo && (
                <img 
                  src={tool.logo} 
                  alt={`${tool.name} logo`} 
                  className="w-10 h-10 object-contain"
                />
              )}
              <div>
                <h3 className="font-semibold">{tool.name}</h3>
                <p className="text-sm text-gray-600">{tool.description}</p>
              </div>
            </div>
            
            <div className="mt-3 flex items-center gap-4">
              <div className="text-sm">
                👍 {voteCounts[tool.id]?.upvotes || 0}
              </div>
              <div className="text-sm">
                👎 {voteCounts[tool.id]?.downvotes || 0}
              </div>
              {tool.url && (
                <a 
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-500 hover:underline ml-auto"
                >
                  Visit →
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 