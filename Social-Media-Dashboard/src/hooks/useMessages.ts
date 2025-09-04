import { useState, useEffect, useCallback } from 'react';

export interface Message {
  id: string;
  platform: 'facebook' | 'instagram' | 'gmail';
  senderId: string;
  senderName: string;
  senderEmail?: string;
  recipientId: string;
  recipientName: string;
  content: {
    text: string;
    attachments?: Array<{
      type: string;
      url: string;
      name?: string;
    }>;
  };
  timestamp: string;
  conversationId: string;
  isRead: boolean;
  isReplied: boolean;
  status: 'new' | 'pending' | 'resolved' | 'archived';
}

export interface MessagesResponse {
  success: boolean;
  data: {
    messages: Message[];
    pagination: {
      page: number;
      limit: number;
      totalCount: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  message?: string;
}

export function useMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch Instagram messages using Messenger API
  const fetchInstagramMessages = useCallback(async () => {
    try {
      const response = await fetch('/api/instagram/messages?limit=50');
      const data = await response.json();
      
      if (data.success && data.data?.messages) {
        // Transform Instagram API messages to match the Message interface
        const instagramMessages: Message[] = data.data.messages.map((msg: Record<string, unknown>) => ({
          id: String(msg.id),
          platform: 'instagram' as const,
          senderId: String(msg.senderId),
          senderName: String(msg.senderName) || 'Instagram User',
          recipientId: String(msg.recipientId) || '',
          recipientName: 'OfinaPulse',
          content: {
            text: String((msg.content as Record<string, unknown>)?.text) || '',
            attachments: ((msg.content as Record<string, unknown>)?.attachments as Array<Record<string, unknown>>) || []
          },
          timestamp: String(msg.timestamp),
          conversationId: String(msg.conversationId),
          isRead: Boolean(msg.isRead),
          isReplied: Boolean(msg.isReplied),
          status: String(msg.status) === 'read' ? 'resolved' : (String(msg.status) === 'replied' ? 'resolved' : 'new')
        }));
        
        return instagramMessages;
      } else {
        // API returned error or no data
        console.error('Instagram API failed:', {
          success: data.success,
          error: data.error,
          message: data.message,
          instructions: data.instructions
        });
        return [];
      }
    } catch (err) {
      console.error('Failed to fetch Instagram messages:', err);
      // Still return empty array to not break the UI, but log the actual error
      return [];
    }
  }, []);

  // Fetch Facebook messages specifically
  const fetchFacebookMessages = useCallback(async () => {
    try {
      const response = await fetch('/api/facebook/messages?limit=50');
      const data = await response.json();
      
      if (data.success && data.data?.messages) {
        // Transform Facebook messages to match the Message interface
        const facebookMessages: Message[] = data.data.messages.map((msg: Record<string, unknown>) => ({
          id: String(msg.id),
          platform: 'facebook' as const,
          senderId: String(msg.senderId),
          senderName: String(msg.senderName) || 'Facebook User',
          recipientId: String(msg.recipientId) || '',
          recipientName: 'OfinaPulse',
          content: {
            text: String((msg.content as Record<string, unknown>)?.text) || '',
            attachments: ((msg.content as Record<string, unknown>)?.attachments as Array<Record<string, unknown>>) || []
          },
          timestamp: String(msg.timestamp),
          conversationId: String(msg.conversationId),
          isRead: Boolean(msg.isRead),
          isReplied: Boolean(msg.isReplied),
          status: String(msg.status) === 'read' ? 'resolved' : (String(msg.status) === 'replied' ? 'resolved' : 'new')
        }));
        
        return facebookMessages;
      } else {
        // API returned error or no data
        console.error('Facebook API failed:', {
          success: data.success,
          error: data.error,
          message: data.message,
          fallback: data.fallback
        });
        return [];
      }
    } catch (err) {
      console.error('Failed to fetch Facebook messages:', err);
      return [];
    }
  }, []);

  // Enhanced fetch messages that combines all sources
  const fetchMessages = useCallback(async (platform?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const promises = [];
      
      // Fetch Facebook messages if not filtering to a different platform
      if (!platform || platform === 'facebook') {
        promises.push(fetchFacebookMessages());
      }
      
      // Fetch Instagram messages if not filtering to a different platform
      if (!platform || platform === 'instagram') {
        promises.push(fetchInstagramMessages());
      }
      
      const results = await Promise.all(promises);
      let allMessages: Message[] = [];
      
      // Combine all messages from different sources
      for (const messageArray of results) {
        if (messageArray && Array.isArray(messageArray)) {
          allMessages = [...allMessages, ...messageArray];
        }
      }
      
      // Remove duplicates based on message ID
      const uniqueMessages = allMessages.filter((msg, index, self) => 
        index === self.findIndex(m => m.id === msg.id)
      );
      
      // Sort by timestamp (newest first)
      uniqueMessages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      setMessages(uniqueMessages);
      setLastUpdated(new Date());
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchFacebookMessages, fetchInstagramMessages]);

  // Send a reply message
  const sendReply = useCallback(async (recipientId: string, message: string, platform: string = 'facebook') => {
    setLoading(true);
    setError(null);
    
    try {
      let endpoint = '/api/messages';
      
      // Use platform-specific endpoints
      if (platform === 'facebook') {
        endpoint = '/api/facebook/messages';
      } else if (platform === 'instagram') {
        endpoint = '/api/instagram/messages';
      }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientId,
          message,
          messageType: 'text',
          platform
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Refresh messages after sending reply
        await fetchMessages();
        return true;
      } else {
        throw new Error(data.message || 'Failed to send reply');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error sending reply:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchMessages]);

  // Mark message as read
  const markAsRead = useCallback(async (messageId: string) => {
    try {
      // Optimistically update UI
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, isRead: true } : msg
        )
      );

      const response = await fetch(`/api/messages/${messageId}/read`, {
        method: 'POST',
      });

      if (!response.ok) {
        // Revert optimistic update on failure
        setMessages(prev => 
          prev.map(msg => 
            msg.id === messageId ? { ...msg, isRead: false } : msg
          )
        );
        throw new Error('Failed to mark message as read');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error marking message as read:', err);
    }
  }, []);

  // Get unread message count
  const unreadCount = messages.filter(msg => !msg.isRead).length;

  // Auto-fetch messages on hook initialization
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Get messages by platform
  const getMessagesByPlatform = useCallback((platform: string) => {
    return messages.filter(msg => msg.platform === platform);
  }, [messages]);

  // Auto-refresh messages every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchMessages();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [fetchMessages]);

  // Initial fetch
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return {
    messages,
    loading,
    error,
    lastUpdated,
    unreadCount,
    fetchMessages,
    sendReply,
    markAsRead,
    getMessagesByPlatform,
  };
}