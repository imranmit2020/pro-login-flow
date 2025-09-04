import { createClient } from '@supabase/supabase-js';
import { FacebookMessage } from './facebookApi';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Facebook page configurations
const FACEBOOK_PAGES = [
  {
    id: process.env.FACEBOOK_PAGE_ID || "381898425500628",
    name: "Smile Experts Dental"
  },
  {
    id: process.env.SECOND_FACEBOOK_PAGE_ID || "274759011056987",
    name: "Smile Experts Dental (Dental Office, Washington, DC)"
  }
];

export interface StoredFacebookMessage {
  message_id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  receipt_id: string;
  message_text: string | null;
  attachments: any[];
  timestamp: string;
  platform: 'facebook' | 'instagram';
  is_replied: boolean;
  replied_by: 'AI' | 'human' | null;
  reply_message_id: string | null;
}

export class FacebookMessageService {
  // Get page name by ID
  static getPageName(pageId: string): string {
    const page = FACEBOOK_PAGES.find(p => p.id === pageId);
    return page?.name || 'Unknown Page';
  }

  // Check if sender_id or receipt_id is a page ID
  static isFromPage(senderId: string, receiptId?: string): boolean {
    return FACEBOOK_PAGES.some(page => page.id === senderId || page.id === receiptId);
  }

  // Store a single Facebook message
  static async storeMessage(message: FacebookMessage, conversationId: string): Promise<void> {
    try {
      // Check if message is from our page (outgoing)
      const isFromPage = FACEBOOK_PAGES.some(page => page.id === message.from.id);
      
      // Get the correct page name from our configuration
      const page = FACEBOOK_PAGES.find(p => p.id === message.from.id);
      const senderName = page ? page.name : message.from.name;
      
      const storedMessage: StoredFacebookMessage = {
        message_id: message.id,
        conversation_id: conversationId,
        sender_id: message.from.id,
        sender_name: senderName, // Use our configured page name
        receipt_id: message.to.data[0]?.id || '',
        message_text: message.message || null,
        attachments: message.attachments?.data || [],
        timestamp: message.created_time,
        platform: 'facebook',
        is_replied: isFromPage, // If message is from page, it's a reply
        replied_by: isFromPage ? 'human' : null,
        reply_message_id: null
      };

      const { error } = await supabase
        .from('facebook_messages')
        .upsert(storedMessage, {
          onConflict: 'message_id'
        });

      if (error) {
        console.error('Error storing Facebook message:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to store Facebook message:', error);
      throw error;
    }
  }

  // Store multiple Facebook messages
  static async storeMessages(messages: FacebookMessage[], conversationId: string): Promise<void> {
    try {
      const storedMessages: StoredFacebookMessage[] = messages.map(message => {
        // Check if message is from our page (outgoing)
        const isFromPage = FACEBOOK_PAGES.some(page => page.id === message.from.id);
        
        // Get the correct page name from our configuration
        const page = FACEBOOK_PAGES.find(p => p.id === message.from.id);
        const senderName = page ? page.name : message.from.name;
        
        return {
          message_id: message.id,
          conversation_id: conversationId,
          sender_id: message.from.id,
          sender_name: senderName, // Use our configured page name
          receipt_id: message.to.data[0]?.id || '',
          message_text: message.message || null,
          attachments: message.attachments?.data || [],
          timestamp: message.created_time,
          platform: 'facebook',
          is_replied: isFromPage, // If message is from page, it's a reply
          replied_by: isFromPage ? 'human' : null,
          reply_message_id: null
        };
      });

      const { error } = await supabase
        .from('facebook_messages')
        .upsert(storedMessages, {
          onConflict: 'message_id'
        });

      if (error) {
        console.error('Error storing Facebook messages:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to store Facebook messages:', error);
      throw error;
    }
  }

  // Mark a message as replied
  static async markMessageAsReplied(messageId: string, repliedBy: 'AI' | 'human', replyMessageId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('facebook_messages')
        .update({
          is_replied: true,
          replied_by: repliedBy,
          reply_message_id: replyMessageId
        })
        .eq('message_id', messageId);

      if (error) {
        console.error('Error marking message as replied:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to mark message as replied:', error);
      throw error;
    }
  }

  // Get unreplied messages
  static async getUnrepliedMessages(): Promise<StoredFacebookMessage[]> {
    try {
      const { data, error } = await supabase
        .from('facebook_messages')
        .select('*')
        .eq('is_replied', false)
        .order('timestamp', { ascending: true });

      if (error) {
        console.error('Error fetching unreplied messages:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Failed to fetch unreplied messages:', error);
      throw error;
    }
  }

  // Subscribe to new messages
  static subscribeToNewMessages(callback: (message: StoredFacebookMessage) => void): (() => void) {
    const subscription = supabase
      .channel('facebook_messages_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'facebook_messages'
        },
        (payload) => {
          callback(payload.new as StoredFacebookMessage);
        }
      )
      .subscribe();

    // Return unsubscribe function
    return () => {
      subscription.unsubscribe();
    };
  }
} 