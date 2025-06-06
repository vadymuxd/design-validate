import { useState, useEffect } from 'react';
import { Category } from '../types/Tool';

export interface Vote {
  toolName: string;
  direction: 'up' | 'down' | null;
}

export interface VoteCount {
  up: number;
  down: number;
}

export interface VoteCounts {
  [category: string]: {
    [toolName: string]: VoteCount;
  };
}

export interface UserVotes {
  [category: string]: {
    [toolName: string]: 'up' | 'down' | null;
  };
}

const STORAGE_KEY = 'design-validate-votes';
const USER_VOTES_KEY = 'design-validate-user-votes';

// Simulate IP-based identification (in a real app, this would be handled server-side)
const getUserId = (): string => {
  let userId = localStorage.getItem('user-id');
  if (!userId) {
    userId = Math.random().toString(36).substring(2, 15);
    localStorage.setItem('user-id', userId);
  }
  return userId;
};

export const useVoting = () => {
  const [voteCounts, setVoteCounts] = useState<VoteCounts>({});
  const [userVotes, setUserVotes] = useState<UserVotes>({});
  const userId = getUserId();

  // Load initial data from localStorage
  useEffect(() => {
    const savedVotes = localStorage.getItem(STORAGE_KEY);
    const savedUserVotes = localStorage.getItem(`${USER_VOTES_KEY}-${userId}`);
    
    if (savedVotes) {
      setVoteCounts(JSON.parse(savedVotes));
    }
    
    if (savedUserVotes) {
      setUserVotes(JSON.parse(savedUserVotes));
    }
  }, [userId]);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(voteCounts));
  }, [voteCounts]);

  useEffect(() => {
    localStorage.setItem(`${USER_VOTES_KEY}-${userId}`, JSON.stringify(userVotes));
  }, [userVotes, userId]);

  const vote = (category: Category, toolName: string, direction: 'up' | 'down') => {
    const currentVote = userVotes[category]?.[toolName];
    
    setVoteCounts(prev => {
      const categoryVotes = prev[category] || {};
      const current = categoryVotes[toolName] || { up: 0, down: 0 };
      let newCounts = { ...current };
      
      // Remove previous vote if exists
      if (currentVote === 'up') {
        newCounts.up = Math.max(0, newCounts.up - 1);
      } else if (currentVote === 'down') {
        newCounts.down = Math.max(0, newCounts.down - 1);
      }
      
      // Add new vote if different from current
      if (currentVote !== direction) {
        if (direction === 'up') {
          newCounts.up += 1;
        } else {
          newCounts.down += 1;
        }
      }
      
      return {
        ...prev,
        [category]: {
          ...categoryVotes,
          [toolName]: newCounts
        }
      };
    });

    setUserVotes(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [toolName]: currentVote === direction ? null : direction
      }
    }));
  };

  const getVoteCount = (category: Category, toolName: string): VoteCount => {
    return voteCounts[category]?.[toolName] || { up: 0, down: 0 };
  };

  const getUserVote = (category: Category, toolName: string): 'up' | 'down' | null => {
    return userVotes[category]?.[toolName] || null;
  };

  const getNetScore = (category: Category, toolName: string): number => {
    const counts = getVoteCount(category, toolName);
    return counts.up - counts.down;
  };

  return {
    vote,
    getVoteCount,
    getUserVote,
    getNetScore
  };
};