import { useState, useEffect, useCallback } from 'react';
import { InstagramMessageService, StoredInstagramMessage } from '@/lib/instagramMessageService';

export interface InstagramConversation {
  conversationId: string;
  messages: StoredInstagramMessage[];
  lastMessage: StoredInstagramMessage;
  unreadCount: number;
  isReplied: boolean;
  participants: string[];
}

interface UseInstagramMessagesState {
  conversations: InstagramConversation[];
  totalMessages: number;
}

export function useInstagramMessages() {
  const [state, setState] = useState<UseInstagramMessagesState>({
    conversations: [],
    totalMessages: 0
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate total unread count
  const totalUnreadCount = state.conversations.reduce((total, conv) => total + conv.unreadCount, 0);

  // Fetch conversations from the API (this triggers background sync)
  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Call the Instagram messages API endpoint (this triggers background sync)
      const response = await fetch('/api/instagram/messages');
      const result = await response.json();

      console.log('🔍 Instagram API Response:', result); // Debug log

      if (result.success && result.data) {
        // If we have conversations data, use it
        if (result.data.conversations) {
          console.log('📊 Conversations data:', result.data.conversations); // Debug log
          
          const conversations = result.data.conversations.map((conv: any) => ({
            conversationId: conv.id,
            messages: conv.messages || [],
            lastMessage: conv.lastMessage,
            unreadCount: conv.unreadCount || 0,
            isReplied: conv.isReplied || false,
            participants: conv.participants || []
          }));

          console.log('🔍 Mapped conversations:', conversations); // Debug log

          const totalMessages = conversations.reduce((total: number, conv: any) => total + conv.messages.length, 0);

          setState({
            conversations,
            totalMessages
          });
        } else {
          // Fallback to direct service call if API doesn't return conversations format
          const conversations = await InstagramMessageService.getConversations();
          const totalMessages = conversations.reduce((total, conv) => total + conv.messages.length, 0);

          setState({
            conversations,
            totalMessages
          });
        }
      } else {
        throw new Error(result.error || 'Failed to fetch Instagram conversations');
      }
    } catch (err) {
      console.error('Error fetching Instagram conversations:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch conversations');
      
      // Fallback to direct service call on API error
      try {
        const conversations = await InstagramMessageService.getConversations();
        const totalMessages = conversations.reduce((total, conv) => total + conv.messages.length, 0);

        setState({
          conversations,
          totalMessages
        });
        setError(null); // Clear error if fallback succeeds
      } catch (fallbackErr) {
        console.error('Fallback also failed:', fallbackErr);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Send a reply to a conversation
  const sendReply = useCallback(async (recipientId: string, message: string, conversationId: string): Promise<boolean> => {
    try {
      // Call the Instagram API to send the message
      const response = await fetch('/api/instagram/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientId,
          message,
          conversationId
        }),
      });

      const result = await response.json();

      if (result.success) {
        console.log('Instagram message sent successfully');
        
        // Refresh conversations to show the new message
        await fetchConversations();
        
        return true;
      } else {
        console.error('Failed to send Instagram message:', result.error);
        setError(result.error || 'Failed to send message');
        return false;
      }
    } catch (err) {
      console.error('Error sending Instagram reply:', err);
      setError(err instanceof Error ? err.message : 'Failed to send reply');
      return false;
    }
  }, [fetchConversations]);

  // Mark a conversation as read
  const markConversationAsRead = useCallback(async (conversationId: string): Promise<void> => {
    try {
      await InstagramMessageService.markConversationAsRead(conversationId);
      
      // Update local state
      setState(prev => ({
        ...prev,
        conversations: prev.conversations.map(conv => 
          conv.conversationId === conversationId 
            ? { ...conv, unreadCount: 0, isReplied: true }
            : conv
        )
      }));
    } catch (err) {
      console.error('Error marking Instagram conversation as read:', err);
      setError(err instanceof Error ? err.message : 'Failed to mark conversation as read');
    }
  }, []);

  // Get a specific conversation
  const getConversation = useCallback((conversationId: string): InstagramConversation | null => {
    return state.conversations.find(conv => conv.conversationId === conversationId) || null;
  }, [state.conversations]);

  // Process AI auto-reply for unreplied messages
  const processAiAutoReply = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch('/api/instagram/ai-auto-reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        console.log(`Processed ${result.processedCount} Instagram messages with AI auto-reply`);
        
        // Refresh conversations to show the AI replies
        await fetchConversations();
      } else {
        console.error('AI auto-reply failed:', result.error);
        setError(result.error || 'AI auto-reply failed');
      }
    } catch (err) {
      console.error('Error processing AI auto-reply for Instagram:', err);
      setError(err instanceof Error ? err.message : 'Failed to process AI auto-reply');
    }
  }, [fetchConversations]);

  // Setup real-time subscription
  useEffect(() => {
    const unsubscribe = InstagramMessageService.subscribeToNewMessages((newMessage) => {
      console.log('New Instagram message received:', newMessage);
      
      // Update conversations with new message
      setState(prev => {
        const conversations = [...prev.conversations];
        const existingConvIndex = conversations.findIndex(
          conv => conv.conversationId === newMessage.conversation_id
        );

        if (existingConvIndex >= 0) {
          // Update existing conversation
          const existingConv = conversations[existingConvIndex];
          const updatedConv = {
            ...existingConv,
            messages: [...existingConv.messages, newMessage],
            lastMessage: newMessage,
            unreadCount: existingConv.unreadCount + (newMessage.is_replied ? 0 : 1),
            isReplied: newMessage.is_replied || existingConv.isReplied
          };
          
          conversations[existingConvIndex] = updatedConv;
          
          // Move to top
          conversations.sort((a, b) => 
            new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime()
          );
        } else {
          // Create new conversation
          const newConv: InstagramConversation = {
            conversationId: newMessage.conversation_id,
            messages: [newMessage],
            lastMessage: newMessage,
            unreadCount: newMessage.is_replied ? 0 : 1,
            isReplied: newMessage.is_replied,
            participants: [newMessage.sender_name]
          };
          
          conversations.unshift(newConv);
        }

        return {
          conversations,
          totalMessages: prev.totalMessages + 1
        };
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Auto-refresh every 30 seconds (like Facebook)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchConversations();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchConversations]);

  return {
    conversations: state.conversations,
    totalMessages: state.totalMessages,
    totalUnreadCount,
    loading,
    error,
    fetchConversations,
    sendReply,
    markConversationAsRead,
    getConversation,
    processAiAutoReply
  };
} 