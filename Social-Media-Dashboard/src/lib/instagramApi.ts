import axios from 'axios';

export interface InstagramMessage {
  id: string;
  from: { id: string; username?: string };
  to: { id: string };
  created_time: string;
  text?: string;
  attachments?: Array<{
    type: string;
    url?: string;
    payload?: { url?: string };
  }>;
}

export interface InstagramConversation {
  id: string;
  participants: Array<{ id: string; username?: string }>;
  updated_time: string;
  message_count?: number;
}

export interface InstagramProfile {
  id: string;
  username?: string;
  name?: string;
  profile_pic?: string;
  followers_count?: number;
  media_count?: number;
}

export interface InstagramComment {
  id: string;
  from: { id: string; username?: string };
  text: string;
  timestamp: string;
  like_count?: number;
  replies?: {
    data: InstagramComment[];
  };
}

export interface InstagramMedia {
  id: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url?: string;
  thumbnail_url?: string;
  caption?: string;
  permalink?: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
}

export class InstagramAPI {
  private accessToken: string;
  private instagramBusinessAccountId: string;
  private baseUrl = 'https://graph.facebook.com/v23.0';
  private useInstagramApi: boolean = false; // Flag to use graph.instagram.com vs graph.facebook.com
  private pageId?: string; // Facebook Page ID (required for messaging)

  constructor(accessToken: string, instagramBusinessAccountId: string, useInstagramApi: boolean = false, pageId?: string) {
    this.accessToken = accessToken;
    this.instagramBusinessAccountId = instagramBusinessAccountId;
    this.useInstagramApi = useInstagramApi;
    this.pageId = pageId;
    
    // Set the appropriate base URL
    if (useInstagramApi) {
      this.baseUrl = 'https://graph.instagram.com/v23.0';
    }
  }

  // Get the Facebook Page ID that's connected to this Instagram account
  private async getConnectedPageId(): Promise<string> {
    if (this.pageId) {
      return this.pageId;
    }

    try {
      console.log('🔍 Finding Facebook Page connected to Instagram account...');
      
      // Method 1: Try to get page ID from 'me' endpoint (if token is page token)
      try {
        const pageResponse = await axios.get(
          `${this.baseUrl}/me`,
          {
            params: {
              fields: 'id,name,instagram_business_account',
              access_token: this.accessToken
            }
          }
        );
        
        if (pageResponse.data?.id && pageResponse.data?.instagram_business_account?.id === this.instagramBusinessAccountId) {
          console.log('✅ Found connected page via me endpoint:', pageResponse.data.id);
          this.pageId = pageResponse.data.id;
          return this.pageId!;
        }
      } catch (error) {
        console.log('ℹ️ Token is not a page token, trying alternative method...');
      }

      // Method 2: Search through accessible pages
      const pagesResponse = await axios.get(
        `${this.baseUrl}/me/accounts`,
        {
          params: {
            fields: 'id,name,instagram_business_account',
            access_token: this.accessToken
          }
        }
      );

      if (pagesResponse.data?.data) {
        for (const page of pagesResponse.data.data) {
          if (page.instagram_business_account?.id === this.instagramBusinessAccountId) {
            console.log('✅ Found connected page via accounts search:', page.id);
            this.pageId = page.id;
            return this.pageId!;
          }
        }
      }

      throw new Error(`No Facebook Page found connected to Instagram Business Account ${this.instagramBusinessAccountId}`);
      
    } catch (error) {
      console.error('❌ Error finding connected Facebook Page:', error);
      throw new Error('Unable to find Facebook Page connected to Instagram account. Make sure your Instagram Business Account is connected to a Facebook Page and your token has the required permissions.');
    }
  }

  // Get Instagram Business Account profile information
  async getProfile(): Promise<InstagramProfile> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/${this.instagramBusinessAccountId}`,
        {
          params: {
            fields: 'id,username,name,profile_picture_url,followers_count,media_count',
            access_token: this.accessToken
          }
        }
      );
      
      return {
        id: response.data.id,
        username: response.data.username,
        name: response.data.name,
        profile_pic: response.data.profile_picture_url,
        followers_count: response.data.followers_count,
        media_count: response.data.media_count
      };
    } catch (error) {
      console.error('Error fetching Instagram profile:', error);
      throw error;
    }
  }

  // Get Instagram conversations (DMs)
  async getConversations(limit: number = 25): Promise<InstagramConversation[]> {
    try {
      // For Instagram conversations, we need to use the Facebook Page API
      // since Instagram Direct Messages are accessed through the Facebook Page
      
      console.log('Fetching Instagram conversations...');
      
      // Step 1: Get the Facebook Page ID that's connected to this Instagram account
      // Instead of looking for a page from Instagram, we need to look for Instagram from the Page
      // Use 'me' to reference the current authenticated Page
      const pageResponse = await axios.get(
        `${this.baseUrl}/me`,
        {
          params: {
            fields: 'id,name,instagram_business_account',
            access_token: this.accessToken
          }
        }
      );
      
      if (!pageResponse.data?.id) {
        console.error('Could not find Facebook Page ID from token');
        throw new Error('Could not find Facebook Page ID from token');
      }
      
      const pageId = pageResponse.data.id;
      console.log(`Found Facebook Page ID: ${pageId}`);
      
      // Verify this page is connected to our Instagram Business Account
      if (pageResponse.data?.instagram_business_account?.id !== this.instagramBusinessAccountId) {
        console.warn(`Warning: Page (${pageId}) is connected to Instagram account ${pageResponse.data?.instagram_business_account?.id}, but we're using ${this.instagramBusinessAccountId}`);
      }
      
      // Step 2: Use the Page ID to get conversations with platform=instagram filter
      const endpoint = `${this.baseUrl}/${pageId}/conversations`;
      const params = {
        platform: 'instagram',
        access_token: this.accessToken,
        limit: limit,
        fields: 'id,participants,updated_time,message_count'
      };

      console.log('Fetching Instagram conversations from page endpoint:', endpoint);
      
      const response = await axios.get(endpoint, { params });

      if (response.data && response.data.data) {
        if (response.data.data.length === 0) {
          console.log('No Instagram conversations found for this page');
        }
        return response.data.data.map((conv: any) => ({
          id: conv.id,
          participants: conv.participants?.data || [],
          updated_time: conv.updated_time,
          message_count: conv.message_count || 0
        }));
      }

      return [];
    } catch (error) {
      console.error('Error fetching Instagram conversations:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response status:', error.response?.status);
        console.error('Response data:', error.response?.data);
      }
      
      // Return empty array instead of throwing to prevent UI failures
      return [];
    }
  }

  // Get messages from a specific conversation
  async getMessages(conversationId: string, limit: number = 25): Promise<InstagramMessage[]> {
    try {
      let messages: any[] = [];
      
      if (this.useInstagramApi) {
        // New API: Get message IDs from conversation, then get message details
        const messagesResponse = await axios.get(`${this.baseUrl}/${conversationId}`, {
          params: {
            fields: 'messages',
            access_token: this.accessToken,
          }
        });
        
        if (messagesResponse.data && messagesResponse.data.messages && messagesResponse.data.messages.data) {
          const messageIds = messagesResponse.data.messages.data.map((m: any) => m.id).slice(0, limit);

          const messagePromises = messageIds.map((id: string) => 
            axios.get(`${this.baseUrl}/${id}`, {
              params: {
                fields: 'id,created_time,from,to,text,attachments',
                access_token: this.accessToken
              }
            }).then(res => res.data)
          );
          
          messages = await Promise.all(messagePromises);
        }
      } else {
        // Old API: Get messages directly from conversation
        const response = await axios.get(`${this.baseUrl}/${conversationId}`, {
          params: {
            fields: 'messages{id,from,to,created_time,message,attachments}',
            access_token: this.accessToken,
          },
        });
        if (response.data && response.data.messages && response.data.messages.data) {
          messages = response.data.messages.data;
        }
      }

      return messages.slice(0, limit).map((msg: any) => ({
        id: msg.id,
        from: msg.from,
        to: msg.to?.data ? msg.to.data[0] : msg.to,
        created_time: msg.created_time,
        text: msg.message || msg.text,
        attachments: msg.attachments?.data || msg.attachments || [],
      }));

    } catch (error) {
      console.error(`Error fetching Instagram messages for conv ${conversationId}:`, error);
      if (axios.isAxiosError(error)) {
        console.error('Response status:', error.response?.status);
        console.error('Response data:', error.response?.data);
      }
      throw error;
    }
  }

  // Send a message to an Instagram user
  async sendMessage(recipientId: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      console.log('📤 Attempting to send Instagram message:', {
        recipientId,
        messageLength: message.length,
        instagramBusinessAccountId: this.instagramBusinessAccountId,
        baseUrl: this.baseUrl,
        hasAccessToken: !!this.accessToken,
        accessTokenLength: this.accessToken?.length
      });

      // Validate inputs
      if (!recipientId || recipientId.trim().length === 0) {
        throw new Error('Recipient ID is required and cannot be empty');
      }

      if (!message || message.trim().length === 0) {
        throw new Error('Message text is required and cannot be empty');
      }

      if (!this.accessToken) {
        throw new Error('Access token is required');
      }

      if (!this.instagramBusinessAccountId) {
        throw new Error('Instagram Business Account ID is required');
      }

      // Get the Facebook Page ID that's connected to this Instagram account
      console.log('🔍 Getting connected Facebook Page ID...');
      const pageId = await this.getConnectedPageId();
      console.log('✅ Using Facebook Page ID:', pageId);

      // Use Facebook Page messages endpoint (correct for Instagram messaging)
      // Instagram messaging goes through the Facebook Page, not directly to Instagram
      const endpoint = `${this.baseUrl}/${pageId}/messages`;
      const requestData = {
        recipient: { id: recipientId },
        message: { text: message.trim() },
        messaging_type: 'RESPONSE' // Important for Instagram replies
      };

      console.log('📤 Making Instagram API request via Facebook Page:', {
        endpoint,
        requestData,
        method: 'POST'
      });

      const response = await axios.post(
        endpoint,
        requestData,
        {
          params: {
            access_token: this.accessToken
          },
          timeout: 30000, // 30 second timeout
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✅ Instagram API response:', {
        status: response.status,
        data: response.data,
        headers: response.headers
      });

      if (response.data && response.data.message_id) {
        return {
          success: true,
          messageId: response.data.message_id
        };
      } else if (response.data && response.data.recipient_id) {
        // Some endpoints return recipient_id instead of message_id
        return {
          success: true,
          messageId: `msg_${response.data.recipient_id}_${Date.now()}`
        };
      } else {
        console.warn('⚠️ Instagram API response missing message_id:', response.data);
        return {
          success: false,
          error: 'Instagram API response missing message_id'
        };
      }

    } catch (error: unknown) {
      console.error('❌ Error sending Instagram message:', error);

      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const data = error.response?.data;
        
        console.error('Instagram API Error Details:', {
          status,
          data,
          message: error.message,
          code: error.code
        });

        // Handle specific Instagram API errors
        if (status === 400) {
          if (data?.error?.message?.includes('Invalid user ID')) {
            return {
              success: false,
              error: 'Invalid recipient ID: User not found or cannot receive messages'
            };
          }
          if (data?.error?.message?.includes('This user can\'t receive messages')) {
            return {
              success: false,
              error: 'User cannot receive messages (may not have messaged you first)'
            };
          }
          if (data?.error?.message?.includes('Application does not have the capability')) {
            return {
              success: false,
              error: 'App missing required permissions. Need pages_messaging and instagram_basic permissions for Instagram messaging.'
            };
          }
          if (data?.error?.code === 3) {
            return {
              success: false,
              error: 'OAuth capability error: Your app needs pages_messaging permission and must be approved for Instagram messaging. Check your app permissions in Facebook Developer Console.'
            };
          }
          return {
            success: false,
            error: `Bad request: ${data?.error?.message || 'Invalid request parameters'}`
          };
        }

        if (status === 401) {
          return {
            success: false,
            error: 'Authentication failed: Access token is invalid or expired'
          };
        }

        if (status === 403) {
          return {
            success: false,
            error: 'Permission denied: Insufficient permissions for Instagram messaging. Ensure your app has pages_messaging and instagram_basic permissions.'
          };
        }

        if (status === 429) {
          return {
            success: false,
            error: 'Rate limit exceeded: Too many API requests'
          };
        }

        if (status && status >= 500) {
          return {
            success: false,
            error: 'Instagram server error: Please try again later'
          };
        }

        return {
          success: false,
          error: `Instagram API error (${status}): ${data?.error?.message || error.message}`
        };
      }

      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // Get Instagram media posts
  async getMedia(limit: number = 25): Promise<InstagramMedia[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/${this.instagramBusinessAccountId}/media`,
        {
          params: {
            fields: 'id,media_type,media_url,thumbnail_url,caption,permalink,timestamp,like_count,comments_count',
            limit: limit,
            access_token: this.accessToken
          }
        }
      );

      return response.data.data.map((media: Record<string, unknown>) => ({
        id: String(media.id),
        media_type: String(media.media_type) as 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM',
        media_url: String(media.media_url) || undefined,
        thumbnail_url: String(media.thumbnail_url) || undefined,
        caption: String(media.caption) || undefined,
        permalink: String(media.permalink) || undefined,
        timestamp: String(media.timestamp),
        like_count: Number(media.like_count) || undefined,
        comments_count: Number(media.comments_count) || undefined
      }));
    } catch (error) {
      console.error('Error fetching Instagram media:', error);
      throw error;
    }
  }

  // Get comments on a specific media post
  async getMediaComments(mediaId: string, limit: number = 25): Promise<InstagramComment[]> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/${mediaId}/comments`,
        {
          params: {
            fields: 'id,from,text,timestamp,like_count,replies{id,from,text,timestamp}',
            limit: limit,
            access_token: this.accessToken
          }
        }
      );

      return response.data.data.map((comment: Record<string, unknown>) => ({
        id: String(comment.id),
        from: comment.from as { id: string; username?: string },
        text: String(comment.text),
        timestamp: String(comment.timestamp),
        like_count: Number(comment.like_count) || undefined,
        replies: comment.replies as { data: InstagramComment[] } | undefined
      }));
    } catch (error) {
      console.error('Error fetching Instagram media comments:', error);
      throw error;
    }
  }

  // Reply to a comment
  async replyToComment(commentId: string, message: string): Promise<{ success: boolean; replyId?: string; error?: string }> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/${commentId}/replies`,
        {
          message: message
        },
        {
          params: {
            access_token: this.accessToken
          }
        }
      );

      return {
        success: true,
        replyId: response.data.id
      };
    } catch (error: unknown) {
      console.error('Error replying to Instagram comment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // Set up webhook subscriptions for Instagram
  async subscribeToWebhooks(callbackUrl: string, verifyToken: string, fields: string[]): Promise<{ success: boolean; error?: string }> {
    try {
      await axios.post(
        `${this.baseUrl}/${this.instagramBusinessAccountId}/subscribed_apps`,
        {
          subscribed_fields: fields.join(','),
          callback_url: callbackUrl,
          verify_token: verifyToken
        },
        {
          params: {
            access_token: this.accessToken
          }
        }
      );

      return { success: true };
    } catch (error: unknown) {
      console.error('Error subscribing to Instagram webhooks:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  // Get current webhook subscriptions
  async getWebhookSubscriptions(): Promise<{ subscriptions: string[]; error?: string }> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/${this.instagramBusinessAccountId}/subscribed_apps`,
        {
          params: {
            access_token: this.accessToken
          }
        }
      );

      return {
        subscriptions: response.data.data?.[0]?.subscribed_fields?.split(',') || []
      };
    } catch (error: unknown) {
      console.error('Error getting Instagram webhook subscriptions:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return {
        subscriptions: [],
        error: errorMessage
      };
    }
  }

  // Get user profile information (for message senders)
  async getUserProfile(userId: string): Promise<{ id: string; username?: string; name?: string; profile_pic?: string } | null> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/${userId}`,
        {
          params: {
            fields: 'id,username,name,profile_picture_url',
            access_token: this.accessToken
          }
        }
      );

      return {
        id: response.data.id,
        username: response.data.username,
        name: response.data.name,
        profile_pic: response.data.profile_picture_url
      };
    } catch (error) {
      console.error('Error fetching Instagram user profile:', error);
      return null;
    }
  }
}

// Utility function to create Instagram API instance
export function createInstagramAPI(accessToken?: string, instagramBusinessAccountId?: string, useInstagramApi?: boolean): InstagramAPI {
  const token = accessToken || process.env.INSTAGRAM_ACCESS_TOKEN || process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  const accountId = instagramBusinessAccountId || process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;

  if (!token || !accountId) {
    throw new Error(
      'Instagram API requires access token and business account ID. ' +
      'Set INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_BUSINESS_ACCOUNT_ID environment variables.'
    );
  }

  return new InstagramAPI(token, accountId, useInstagramApi || false);
}

export default InstagramAPI;
