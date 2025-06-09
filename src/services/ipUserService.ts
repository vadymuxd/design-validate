import { supabase } from '../config/supabase'

export interface IpUser {
  id: string
  ip_address: string
  created_at: string
}

export const ipUserService = {
  async getCurrentIp(): Promise<string> {
    try {
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      return data.ip
    } catch (error) {
      console.error('Error fetching IP:', error)
      throw new Error('Could not fetch IP address')
    }
  },

  async findOrCreateUser(): Promise<string> {
    try {
      // Get current IP
      const ipAddress = await this.getCurrentIp()
      
      // Check if user with this IP exists
      const { data: existingUsers, error: searchError } = await supabase
        .from('users')
        .select('id, ip_address')
        .eq('ip_address', ipAddress)
        .maybeSingle()

      if (searchError) throw searchError

      // If user exists, return their ID
      if (existingUsers) {
        return existingUsers.id
      }

      // If no user exists, create new one
      const { data: newUser, error: insertError } = await supabase
        .from('users')
        .insert([
          {
            ip_address: ipAddress,
            name: `Anonymous (${ipAddress})`
          }
        ])
        .select('id')
        .single()

      if (insertError) throw insertError
      if (!newUser) throw new Error('Failed to create user')

      return newUser.id
    } catch (error) {
      console.error('Error in findOrCreateUser:', error)
      throw error
    }
  },

  // Store user ID in localStorage
  storeUserId(userId: string) {
    localStorage.setItem('userId', userId)
  },

  // Get stored user ID
  getStoredUserId(): string | null {
    return localStorage.getItem('userId')
  }
} 