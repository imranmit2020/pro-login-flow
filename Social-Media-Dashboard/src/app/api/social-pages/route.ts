import { NextRequest, NextResponse } from 'next/server';
import { FacebookAPI } from '@/lib/facebookApi';
import { InstagramAPI } from '@/lib/instagramApi';
import { createFacebookAuthService } from '@/lib/facebookAuth';

interface SocialPageData {
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
  accessToken?: string;
}

export async function GET(request: NextRequest) {
  try {
    const pages: SocialPageData[] = [];

    // Try to get Facebook pages data
    try {
      // First Facebook page
      const facebookPageToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
      const facebookPageId = process.env.FACEBOOK_PAGE_ID;

      if (facebookPageToken && facebookPageId) {
        // Verify the token and get page info
        const fbAuth = createFacebookAuthService();
        const pageInfo = await fbAuth.verifyPageToken(facebookPageToken, facebookPageId);
        
        // Get Facebook page statistics
        const facebookApi = new FacebookAPI(facebookPageToken, facebookPageId);
        const conversations = await facebookApi.getConversations(100, 'messenger');
        
        // Calculate statistics
        const totalMessages = conversations.reduce((total, conv) => total + (conv.messages?.data?.length || 0), 0);
        const unreadMessages = conversations.filter(conv => 
          conv.messages?.data?.some(msg => !msg.from.id.includes(facebookPageId))
        ).length;
        
        // Get average response time (placeholder calculation)
        const averageResponseTime = Math.floor(Math.random() * 30) + 5; // 5-35 minutes
        
        // Try to get followers count from page insights
        let followers = 1000; // Default fallback
        try {
          const followersResponse = await fetch(
            `https://graph.facebook.com/v23.0/${facebookPageId}?fields=followers_count&access_token=${facebookPageToken}`
          );
          const followersData = await followersResponse.json();
          followers = followersData.followers_count || followers;
        } catch (error) {
          console.log('Could not fetch followers count, using default');
        }

        pages.push({
          id: pageInfo.id,
          name: pageInfo.name,
          platform: 'facebook',
          profilePicture: `https://graph.facebook.com/v23.0/${pageInfo.id}/picture?type=large`,
          isConnected: true,
          stats: {
            totalMessages,
            unreadMessages,
            averageResponseTime,
            followers,
            engagement: Math.round((totalMessages / followers) * 100 * 10) / 10 // Engagement rate calculation
          },
          lastActivity: conversations.length > 0 ? getLastActivityTime(conversations) : 'No recent activity'
        });
      }

      // Second Facebook page (using different environment variables or fallback data)
      const facebookPageToken2 = process.env.FACEBOOK_PAGE_ACCESS_TOKEN_2;
      const facebookPageId2 = process.env.FACEBOOK_PAGE_ID_2;

      if (facebookPageToken2 && facebookPageId2) {
        // Verify the token and get page info for second page
        const fbAuth2 = createFacebookAuthService();
        const pageInfo2 = await fbAuth2.verifyPageToken(facebookPageToken2, facebookPageId2);
        
        // Get Facebook page statistics for second page
        const facebookApi2 = new FacebookAPI(facebookPageToken2, facebookPageId2);
        const conversations2 = await facebookApi2.getConversations(100, 'messenger');
        
        // Calculate statistics for second page
        const totalMessages2 = conversations2.reduce((total, conv) => total + (conv.messages?.data?.length || 0), 0);
        const unreadMessages2 = conversations2.filter(conv => 
          conv.messages?.data?.some(msg => !msg.from.id.includes(facebookPageId2))
        ).length;
        
        // Get average response time (placeholder calculation)
        const averageResponseTime2 = Math.floor(Math.random() * 30) + 5; // 5-35 minutes
        
        // Try to get followers count from page insights for second page
        let followers2 = 1500; // Default fallback for second page
        try {
          const followersResponse2 = await fetch(
            `https://graph.facebook.com/v23.0/${facebookPageId2}?fields=followers_count&access_token=${facebookPageToken2}`
          );
          const followersData2 = await followersResponse2.json();
          followers2 = followersData2.followers_count || followers2;
        } catch (error) {
          console.log('Could not fetch followers count for second page, using default');
        }

        pages.push({
          id: pageInfo2.id,
          name: pageInfo2.name,
          platform: 'facebook',
          profilePicture: `https://graph.facebook.com/v23.0/${pageInfo2.id}/picture?type=large`,
          isConnected: true,
          stats: {
            totalMessages: totalMessages2,
            unreadMessages: unreadMessages2,
            averageResponseTime: averageResponseTime2,
            followers: followers2,
            engagement: Math.round((totalMessages2 / followers2) * 100 * 10) / 10 // Engagement rate calculation
          },
          lastActivity: conversations2.length > 0 ? getLastActivityTime(conversations2) : 'No recent activity'
        });
      } else {
        // Add a second Facebook page with fallback data if environment variables are not set
        pages.push({
          id: 'facebook_page_2',
          name: 'Second Facebook Page',
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
          lastActivity: 'Not connected'
        });
      }
    } catch (facebookError) {
      console.error('Error fetching Facebook page data:', facebookError);
      
      // Add disconnected Facebook page entries
      pages.push(
        {
          id: 'facebook_disconnected',
          name: 'Facebook Page',
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
          lastActivity: 'Not connected'
        },
        {
          id: 'facebook_page_2',
          name: 'Second Facebook Page',
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
          lastActivity: 'Not connected'
        }
      );
    }

    // Try to get Instagram page data
    try {
      const instagramAccessToken = process.env.INSTAGRAM_ACCESS_TOKEN || process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
      const instagramBusinessAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;

      if (instagramAccessToken && instagramBusinessAccountId) {
        const instagramApi = new InstagramAPI(instagramAccessToken, instagramBusinessAccountId);
        
        // Get Instagram profile info
        const profile = await instagramApi.getProfile();
        
        // Get Instagram conversations
        const conversations = await instagramApi.getConversations(50);
        
        // Calculate statistics
        const totalMessages = conversations.reduce((total, conv) => total + (conv.message_count || 0), 0);
        const unreadMessages = Math.floor(conversations.length * 0.3); // Estimate 30% unread
        const averageResponseTime = Math.floor(Math.random() * 45) + 10; // 10-55 minutes
        
        pages.push({
          id: profile.id,
          name: profile.name || profile.username || 'Instagram Business Account',
          platform: 'instagram',
          profilePicture: profile.profile_pic || '/api/placeholder/48/48',
          isConnected: true,
          stats: {
            totalMessages,
            unreadMessages,
            averageResponseTime,
            followers: profile.followers_count || 0,
            engagement: Math.round(((profile.media_count || 0) / (profile.followers_count || 1)) * 100 * 10) / 10
          },
          lastActivity: conversations.length > 0 ? getLastActivityTimeInstagram(conversations) : 'No recent activity'
        });
      }
    } catch (instagramError) {
      console.error('Error fetching Instagram page data:', instagramError);
      
      // Add a disconnected Instagram page entry
      pages.push({
        id: 'instagram_disconnected',
        name: 'Instagram Business Account',
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
        lastActivity: 'Not connected'
      });
    }

    // If no pages found, add default disconnected entries
    if (pages.length === 0) {
      pages.push(
        {
          id: 'facebook_default',
          name: 'Connect Facebook Page',
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
          lastActivity: 'Not connected'
        },
        {
          id: 'instagram_default',
          name: 'Connect Instagram Account',
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
          lastActivity: 'Not connected'
        }
      );
    }

    return NextResponse.json({
      success: true,
      data: pages
    });

  } catch (error) {
    console.error('Error fetching social pages data:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch social pages data',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Helper function to get last activity time from Facebook conversations
function getLastActivityTime(conversations: any[]): string {
  if (!conversations.length) return 'No recent activity';
  
  const latestMessage = conversations
    .flatMap(conv => conv.messages?.data || [])
    .sort((a, b) => new Date(b.created_time).getTime() - new Date(a.created_time).getTime())[0];
  
  if (!latestMessage) return 'No recent activity';
  
  const now = new Date();
  const messageTime = new Date(latestMessage.created_time);
  const diffMinutes = Math.floor((now.getTime() - messageTime.getTime()) / (1000 * 60));
  
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
}

// Helper function to get last activity time from Instagram conversations
function getLastActivityTimeInstagram(conversations: any[]): string {
  if (!conversations.length) return 'No recent activity';
  
  const latestConversation = conversations
    .sort((a, b) => new Date(b.updated_time).getTime() - new Date(a.updated_time).getTime())[0];
  
  if (!latestConversation) return 'No recent activity';
  
  const now = new Date();
  const updateTime = new Date(latestConversation.updated_time);
  const diffMinutes = Math.floor((now.getTime() - updateTime.getTime()) / (1000 * 60));
  
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
  
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
} 