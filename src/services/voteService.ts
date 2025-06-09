import { supabase } from '../config/supabase'
import { Tool, Vote, VoteType, ToolVoteCounts } from '../types/database.types'

export const voteService = {
  // Get vote counts for all tools
  async getToolVoteCounts(): Promise<ToolVoteCounts[]> {
    const { data, error } = await supabase
      .from('tool_vote_counts')
      .select('*')
    
    if (error) {
      console.error('Error fetching vote counts:', error)
      throw error
    }
    return data || []
  },

  // Get a user's vote for a specific tool
  async getUserVoteForTool(userId: string, toolId: string): Promise<Vote | null> {
    console.log('Checking existing vote for user:', userId, 'tool:', toolId)
    
    const { data, error } = await supabase
      .from('votes')
      .select('*')
      .eq('user_id', userId)
      .eq('tool_id', toolId)
      .single()
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error checking user vote:', error)
      throw error
    }
    
    console.log('Existing vote found:', data)
    return data
  },

  // Vote for a tool (creates or updates vote)
  async voteForTool(userId: string, toolId: string, voteType: VoteType): Promise<void> {
    console.log('Processing vote:', { userId, toolId, voteType })
    
    try {
      const existingVote = await this.getUserVoteForTool(userId, toolId)

      if (existingVote) {
        if (existingVote.vote_type === voteType) {
          // If voting the same way, remove the vote
          console.log('Removing existing vote:', existingVote.id)
          const { error } = await supabase
            .from('votes')
            .delete()
            .eq('id', existingVote.id)
          
          if (error) {
            console.error('Error deleting vote:', error)
            throw error
          }
          console.log('Vote removed successfully')
        } else {
          // If voting differently, update the vote
          console.log('Updating vote:', existingVote.id, 'to:', voteType)
          const { error } = await supabase
            .from('votes')
            .update({ 
              vote_type: voteType,
              created_at: new Date().toISOString() // Update timestamp
            })
            .eq('id', existingVote.id)
          
          if (error) {
            console.error('Error updating vote:', error)
            throw error
          }
          console.log('Vote updated successfully')
        }
      } else {
        // Create new vote
        console.log('Creating new vote:', { userId, toolId, voteType })
        const { error, data } = await supabase
          .from('votes')
          .insert([{
            user_id: userId,
            tool_id: toolId,
            vote_type: voteType,
            created_at: new Date().toISOString()
          }])
          .select()
        
        if (error) {
          console.error('Error creating vote:', error)
          throw error
        }
        console.log('New vote created successfully:', data)
      }
    } catch (error) {
      console.error('Error in voteForTool:', error)
      throw error
    }
  },

  // Get vote history for a tool
  async getToolVoteHistory(toolId: string): Promise<Vote[]> {
    console.log('Fetching vote history for tool:', toolId)
    
    const { data, error } = await supabase
      .from('votes')
      .select(`
        *,
        users (
          name,
          email,
          ip_address
        )
      `)
      .eq('tool_id', toolId)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching vote history:', error)
      throw error
    }
    
    console.log('Vote history retrieved:', data)
    return data || []
  }
} 