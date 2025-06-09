export type VoteType = 'up' | 'down'

export interface User {
  id: string
  email: string
  name: string | null
  created_at: string
}

export interface Tool {
  id: string
  name: string
  description: string | null
  logo: string | null
  url: string | null
  created_at: string
}

export interface Vote {
  id: string
  user_id: string
  tool_id: string
  vote_type: VoteType
  created_at: string
}

export interface ToolVoteCounts {
  tool_id: string
  tool_name: string
  upvotes: number
  downvotes: number
  vote_score: number
} 