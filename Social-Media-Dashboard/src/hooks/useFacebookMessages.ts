import { useState, useEffect, useCallback } from 'react';
import { FacebookMessageService, StoredFacebookMessage } from '@/lib/facebookMessageService';

export interface FacebookConversation {
  conversationId: string;
  messages: StoredFacebookMessage[];
  lastMessage: StoredFacebookMessage;
  unreadCount: number;
  isReplied: boolean;
  participants: string[];
  pageId?: string;
  pageName?: string;
}

export interface FacebookMessagesState {
  conversations: FacebookConversation[];
  totalMessages: number;
}

export function useFacebookMessages() {
  const [state, setState] = useState<FacebookMessagesState>({
    conversations: [],
    totalMessages: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch conversations from API
  const fetchConversations = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/facebook/messages?limit=200'); // Increased to 200
      const data = await response.json();
      
      if (data.success) {
        setState({
          conversations: data.data.conversations || [],
          totalMessages: data.data.totalMessages || 0
        });
      } else {
        throw new Error(data.message || 'Failed to fetch conversations');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error fetching Facebook conversations:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Send reply to a conversation
  const sendReply = useCallback(async (recipientId: string, message: string, conversationId: string, pageId?: string) => {
    try {
      const response = await fetch('/api/facebook/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientId,
          message,
          conversationId,
          pageId
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        // Refresh conversations after sending reply
        await fetchConversations();
        return true;
      } else {
        throw new Error(data.message || 'Failed to send reply');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Error sending reply:', err);
      return false;
    }
  }, [fetchConversations]);

  // Mark conversation as read
  const markConversationAsRead = useCallback(async (conversationId: string) => {
    try {
      // Update local state optimistically
      setState(prev => ({
        ...prev,
        conversations: prev.conversations.map(conv => 
          conv.conversationId === conversationId 
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      }));

      // Here you could make an API call to mark messages as read
      // For now, we'll just update the local state
    } catch (err) {
      console.error('Error marking conversation as read:', err);
    }
  }, []);

  // Get conversation by ID
  const getConversation = useCallback((conversationId: string) => {
    return state.conversations.find(conv => conv.conversationId === conversationId);
  }, [state.conversations]);

  // Get total unread count
  const totalUnreadCount = state.conversations.reduce((total, conv) => total + conv.unreadCount, 0);

  // Setup real-time subscription
  useEffect(() => {
    const unsubscribe = FacebookMessageService.subscribeToNewMessages((newMessage) => {
      console.log('New Facebook message received:', newMessage);
      
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
          const newConv: FacebookConversation = {
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

  // Auto-refresh every 30 seconds
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
    getConversation
  };
}