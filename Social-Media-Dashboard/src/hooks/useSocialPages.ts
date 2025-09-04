import { useState, useEffect } from 'react';

export interface SocialPage {
  id: string;
  name: string;
  platform: 'facebook' | 'instagram';
  profilePicture: string;
  isConnected: boolean;
  stats: {
    totalMessages: number;
    unreadMessages: number;
    averageResponseTime: number;
    followers: number;
    engagement: number;
  };
  lastActivity: string;
}

export function useSocialPages() {
  const [pages, setPages] = useState<SocialPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPages = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/social-pages');
      const result = await response.json();
      
      if (result.success) {
        setPages(result.data);
      } else {
        setError(result.error || 'Failed to fetch social pages');
        // Set fallback data if API fails
        setPages([
          {
            id: 'facebook_fallback',
            name: 'Facebook Page (Error)',
            platform: 'facebook',
            profilePicture: '/api/placeholder/48/48',
            isConnected: false,
            stats: {
              totalMessages: 0,
              unreadMessages: 0,
              averageResponseTime: 0,
              followers: 0,
              engagement: 0
            },
            lastActivity: 'Connection error'
          },
          {
            id: 'instagram_fallback',
            name: 'Instagram Account (Error)',
            platform: 'instagram',
            profilePicture: '/api/placeholder/48/48',
            isConnected: false,
            stats: {
              totalMessages: 0,
              unreadMessages: 0,
              averageResponseTime: 0,
              followers: 0,
              engagement: 0
            },
            lastActivity: 'Connection error'
          }
        ]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching social pages:', err);
      
      // Set fallback data if fetch fails
      setPages([
        {
          id: 'facebook_fallback',
          name: 'Facebook Page (Offline)',
          platform: 'facebook',
          profilePicture: '/api/placeholder/48/48',
          isConnected: false,
          stats: {
            totalMessages: 0,
            unreadMessages: 0,
            averageResponseTime: 0,
            followers: 0,
            engagement: 0
          },
          lastActivity: 'Offline'
        },
        {
          id: 'instagram_fallback',
          name: 'Instagram Account (Offline)',
          platform: 'instagram',
          profilePicture: '/api/placeholder/48/48',
          isConnected: false,
          stats: {
            totalMessages: 0,
            unreadMessages: 0,
            averageResponseTime: 0,
            followers: 0,
            engagement: 0
          },
          lastActivity: 'Offline'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPages();
  }, []);

  const refetch = () => {
    fetchPages();
  };

  return {
    pages,
    loading,
    error,
    refetch
  };
} 