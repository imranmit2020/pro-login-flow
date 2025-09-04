import { createClient } from '@supabase/supabase-js';
import { InstagramMessage } from './instagramApi';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Instagram Business Account ID - if sender_id equals this, it's from our page
const INSTAGRAM_BUSINESS_ACCOUNT_ID = '17841475533389585';

export interface StoredInstagramMessage {
  message_id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  receipt_id: string;
  message_text: string | null;
  attachments: any[];
  timestamp: string;
  platform: 'instagram';
  is_replied: boolean;
  replied_by: 'AI' | 'human' | null;
  reply_message_id: string | null;
}

export class InstagramMessageService {
  // Store a single Instagram message
  static async storeMessage(message: InstagramMessage, conversationId: string): Promise<void> {
    try {
      // Check if message is from our business account (page) or from a customer
      const isFromPage = message.from.id === INSTAGRAM_BUSINESS_ACCOUNT_ID;
      
      const storedMessage: StoredInstagramMessage = {
        message_id: message.id,
        conversation_id: conversationId,
        sender_id: message.from.id,
        sender_name: message.from.username || 'Instagram User',
        receipt_id: message.to?.id || '',
        message_text: message.text || null,
        attachments: message.attachments || [],
        timestamp: message.created_time,
        platform: 'instagram',
        is_replied: isFromPage, // If message is from our page, it's a reply
        replied_by: isFromPage ? 'human' : null,
        reply_message_id: null
      };

      const { error } = await supabase
        .from('instagram_messages')
        .upsert(storedMessage, {
          onConflict: 'message_id'
        });

      if (error) {
        console.error('Error storing Instagram message:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to store Instagram message:', error);
      throw error;
    }
  }

  // Store multiple Instagram messages
  static async storeMessages(messages: InstagramMessage[], conversationId: string): Promise<void> {
    try {
      const storedMessages: StoredInstagramMessage[] = messages.map(message => {
        // Check if message is from our business account (page) or from a customer
        const isFromPage = message.from.id === INSTAGRAM_BUSINESS_ACCOUNT_ID;
        
        return {
          message_id: message.id,
          conversation_id: conversationId,
          sender_id: message.from.id,
          sender_name: message.from.username || 'Instagram User',
          receipt_id: message.to?.id || '',
          message_text: message.text || null,
          attachments: message.attachments || [],
          timestamp: message.created_time,
          platform: 'instagram',
          is_replied: isFromPage, // If message is from our page, it's a reply
          replied_by: isFromPage ? 'human' : null,
          reply_message_id: null
        };
      });

      const { error } = await supabase
        .from('instagram_messages')
        .upsert(storedMessages, {
          onConflict: 'message_id'
        });

      if (error) {
        console.error('Error storing Instagram messages:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to store Instagram messages:', error);
      throw error;
    }
  }

  // Get all conversations with their messages (simplified version)
  static async getConversations(): Promise<Array<{
    conversationId: string;
    messages: StoredInstagramMessage[];
    lastMessage: StoredInstagramMessage;
    unreadCount: number;
    isReplied: boolean;
    participants: string[];
  }>> {
    try {
      const { data, error } = await supabase
        .from('instagram_messages')
        .select('*')
        .order('timestamp', { ascending: true });

      if (error) {
        console.error('Error fetching Instagram conversations:', error);
        throw error;
      }

      // Group messages by conversation
      const conversationMap = new Map<string, StoredInstagramMessage[]>();
      
      data.forEach(message => {
        const messages = conversationMap.get(message.conversation_id) || [];
        messages.push(message);
        conversationMap.set(message.conversation_id, messages);
      });

      // Convert to conversation format
      return Array.from(conversationMap.entries()).map(([conversationId, messages]) => {
        const lastMessage = messages[messages.length - 1];
        // Count unread messages (messages from customers that haven't been replied to)
        const unreadCount = messages.filter(m => 
          !m.is_replied && 
          m.sender_id !== INSTAGRAM_BUSINESS_ACCOUNT_ID
        ).length;
        
        const participants = [...new Set(messages.map(m => m.sender_name))];
        const isReplied = messages.some(m => m.is_replied);

        return {
          conversationId,
          messages,
          lastMessage,
          unreadCount,
          isReplied,
          participants
        };
      }).sort((a, b) => 
        new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime()
      );
    } catch (error) {
      console.error('Failed to fetch Instagram conversations:', error);
      throw error;
    }
  }

  // Get messages for a specific conversation
  static async getConversationMessages(conversationId: string): Promise<StoredInstagramMessage[]> {
    try {
      const { data, error } = await supabase
        .from('instagram_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('timestamp', { ascending: true });

      if (error) {
        console.error('Error fetching Instagram conversation messages:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch Instagram conversation messages:', error);
      throw error;
    }
  }

  // Mark a message as replied
  static async markMessageAsReplied(messageId: string, repliedBy: 'AI' | 'human', replyMessageId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('instagram_messages')
        .update({
          is_replied: true,
          replied_by: repliedBy,
          reply_message_id: replyMessageId
        })
        .eq('message_id', messageId);

      if (error) {
        console.error('Error marking Instagram message as replied:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to mark Instagram message as replied:', error);
      throw error;
    }
  }

  // Get unreplied messages (only from customers, not from our business account)
  static async getUnrepliedMessages(): Promise<StoredInstagramMessage[]> {
    try {
      const { data, error } = await supabase
        .from('instagram_messages')
        .select('*')
        .eq('is_replied', false)
        .neq('sender_id', INSTAGRAM_BUSINESS_ACCOUNT_ID) // Exclude messages from our business account
        .order('timestamp', { ascending: true });

      if (error) {
        console.error('Error fetching unreplied Instagram messages:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Failed to fetch unreplied Instagram messages:', error);
      throw error;
    }
  }

  // Subscribe to new messages
  static subscribeToNewMessages(callback: (message: StoredInstagramMessage) => void): (() => void) {
    const subscription = supabase
      .channel('instagram_messages_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'instagram_messages'
        },
        (payload) => {
          callback(payload.new as StoredInstagramMessage);
        }
      )
      .subscribe();

    // Return unsubscribe function
    return () => {
      subscription.unsubscribe();
    };
  }

  // Mark conversation as read (mark all unreplied customer messages in conversation as replied)
  static async markConversationAsRead(conversationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('instagram_messages')
        .update({ is_replied: true })
        .eq('conversation_id', conversationId)
        .eq('is_replied', false)
        .neq('sender_id', INSTAGRAM_BUSINESS_ACCOUNT_ID); // Only mark customer messages as read

      if (error) {
        console.error('Error marking Instagram conversation as read:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to mark Instagram conversation as read:', error);
      throw error;
    }
  }

  // Get total counts for dashboard
  static async getCounts(): Promise<{
    totalMessages: number;
    unreadMessages: number;
    totalConversations: number;
  }> {
    try {
      const [messagesResult, unreadResult, conversationsResult] = await Promise.all([
        supabase.from('instagram_messages').select('*', { count: 'exact', head: true }),
        supabase.from('instagram_messages').select('*', { count: 'exact', head: true })
          .eq('is_replied', false)
          .neq('sender_id', INSTAGRAM_BUSINESS_ACCOUNT_ID), // Only count unreplied customer messages
        supabase.from('instagram_messages').select('conversation_id').then(res => {
          if (res.data) {
            return { count: new Set(res.data.map(m => m.conversation_id)).size };
          }
          return { count: 0 };
        })
      ]);

      return {
        totalMessages: messagesResult.count || 0,
        unreadMessages: unreadResult.count || 0,
        totalConversations: conversationsResult.count || 0
      };
    } catch (error) {
      console.error('Failed to get Instagram message counts:', error);
      return {
        totalMessages: 0,
        unreadMessages: 0,
        totalConversations: 0
      };
    }
  }

  // Helper function to check if a message is from our business account
  static isFromBusinessAccount(senderId: string): boolean {
    return senderId === INSTAGRAM_BUSINESS_ACCOUNT_ID;
  }

  // Helper function to get business account ID
  static getBusinessAccountId(): string {
    return INSTAGRAM_BUSINESS_ACCOUNT_ID;
  }
} 