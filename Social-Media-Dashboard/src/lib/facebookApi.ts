import axios from 'axios';
import { FacebookMessageService } from './facebookMessageService';

const FACEBOOK_GRAPH_API_URL = 'https://graph.facebook.com/v23.0';

export interface FacebookMessage {
  id: string;
  message?: string;
  from: {
    id: string;
    name: string;
  };
  to: {
    data: Array<{
      id: string;
      name: string;
    }>;
  };
  created_time: string;
  attachments?: {
    data: Array<{
      type: string;
      url?: string;
      payload?: {
        url: string;
      };
    }>;
  };
}

export interface FacebookConversation {
  id: string;
  platform?: 'messenger' | 'instagram';
  participants: {
    data: Array<{
      id: string;
      name: string;
    }>;
  };
  messages: {
    data: FacebookMessage[];
  };
}

export interface MessageAttachment {
  type: 'image' | 'audio' | 'video' | 'file';
  payload: {
    url: string;
    is_reusable?: boolean;
  };
}

export interface QuickReply {
  content_type: 'text' | 'user_phone_number' | 'user_email';
  title?: string;
  payload?: string;
  image_url?: string;
}

export interface MessageOptions {
  messaging_type?: 'RESPONSE' | 'UPDATE' | 'MESSAGE_TAG';
  message_tag?: string;
  quick_replies?: QuickReply[];
  attachments?: MessageAttachment[];
}

export interface GenericTemplate {
  template_type: 'generic';
  elements: Array<{
    title: string;
    subtitle?: string;
    image_url?: string;
    default_action?: {
      type: 'web_url';
      url: string;
    };
    buttons?: Array<{
      type: 'web_url' | 'postback';
      title: string;
      url?: string;
      payload?: string;
    }>;
  }>;
}

interface ApiResponse {
  data?: Array<{ [key: string]: unknown }>;
}

interface MessageResponse {
  message_id?: string;
  recipient_id?: string;
}

interface UserProfile {
  first_name?: string;
  last_name?: string;
  profile_pic?: string;
}

interface ConversationParams {
  access_token: string;
  fields: string;
  limit: number;
  platform?: string;
}

export class FacebookAPI {
  private pageAccessToken: string;
  private pageId: string;

  constructor(pageAccessToken: string, pageId: string) {
    this.pageAccessToken = pageAccessToken;
    this.pageId = pageId;
  }

  // Get all conversations for the page (both Messenger and Instagram)
  async getConversations(limit: number = 25, platform: 'messenger' | 'instagram' | undefined = undefined): Promise<FacebookConversation[]> {
    try {
      const params: ConversationParams = {
        access_token: this.pageAccessToken,
        fields: 'platform,participants,messages{id,message,from,to,created_time,attachments}',
        limit
      };

      if (platform) {
        params.platform = platform;
      }

      const response = await axios.get<ApiResponse>(
        `${FACEBOOK_GRAPH_API_URL}/${this.pageId}/conversations`,
        { params }
      );

      const conversations = (response.data.data as unknown as FacebookConversation[]) || [];
      
      // Store messages from each conversation
      for (const conversation of conversations) {
        if (conversation.messages?.data) {
          await FacebookMessageService.storeMessages(conversation.messages.data, conversation.id);
        }
      }

      return conversations;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { message?: string } } }; message?: string };
      console.error('Error fetching conversations:', err.response?.data || err.message);
      throw new Error(`Failed to fetch conversations: ${err.response?.data?.error?.message || err.message}`);
    }
  }

  // Get messages from a specific conversation
  async getConversationMessages(conversationId: string, limit: number = 25): Promise<FacebookMessage[]> {
    try {
      const response = await axios.get<ApiResponse>(
        `${FACEBOOK_GRAPH_API_URL}/${conversationId}/messages`,
        {
          params: {
            access_token: this.pageAccessToken,
            fields: 'id,message,from,to,created_time,attachments',
            limit
          }
        }
      );

      const messages = (response.data.data as unknown as FacebookMessage[]) || [];
      
      // Store fetched messages
      await FacebookMessageService.storeMessages(messages, conversationId);

      return messages;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { message?: string } } }; message?: string };
      console.error('Error fetching conversation messages:', err.response?.data || err.message);
      throw new Error(`Failed to fetch messages: ${err.response?.data?.error?.message || err.message}`);
    }
  }

  // Send a basic text message
  async sendMessage(recipientId: string, message: string, options: MessageOptions = {}): Promise<MessageResponse> {
    try {
      interface MessageData {
        recipient: { id: string };
        messaging_type: string;
        message: {
          text: string;
          quick_replies?: QuickReply[];
        };
        message_tag?: string;
      }

      const messageData: MessageData = {
        recipient: { id: recipientId },
        messaging_type: options.messaging_type || 'RESPONSE',
        message: {
          text: message
        }
      };

      // Add quick replies if provided
      if (options.quick_replies && options.quick_replies.length > 0) {
        messageData.message.quick_replies = options.quick_replies;
      }

      // Add message tag if provided
      if (options.message_tag) {
        messageData.message_tag = options.message_tag;
      }

      const response = await axios.post<MessageResponse>(
        `${FACEBOOK_GRAPH_API_URL}/${this.pageId}/messages`,
        messageData,
        {
          params: {
            access_token: this.pageAccessToken
          }
        }
      );

      // Store sent message
      if (response.data.message_id) {
        const sentMessage: FacebookMessage = {
          id: response.data.message_id,
          message: message,
          from: {
            id: this.pageId,
            name: 'OfinaPulse'
          },
          to: {
            data: [{
              id: recipientId,
              name: 'Recipient'
            }]
          },
          created_time: new Date().toISOString()
        };
        
        // Use recipient_id as conversation_id if not available
        await FacebookMessageService.storeMessage(sentMessage, recipientId);
      }

      console.log('Message sent successfully:', response.data);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { message?: string } } }; message?: string };
      console.error('Error sending message:', err.response?.data || err.message);
      throw new Error(`Failed to send message: ${err.response?.data?.error?.message || err.message}`);
    }
  }

  // Send a message with media attachment
  async sendMediaMessage(recipientId: string, attachment: MessageAttachment, options: MessageOptions = {}): Promise<MessageResponse> {
    try {
      interface MediaMessageData {
        recipient: { id: string };
        messaging_type: string;
        message: {
          attachment: MessageAttachment;
        };
        message_tag?: string;
      }

      const messageData: MediaMessageData = {
        recipient: { id: recipientId },
        messaging_type: options.messaging_type || 'RESPONSE',
        message: {
          attachment: attachment
        }
      };

      // Add message tag if provided
      if (options.message_tag) {
        messageData.message_tag = options.message_tag;
      }

      const response = await axios.post<MessageResponse>(
        `${FACEBOOK_GRAPH_API_URL}/${this.pageId}/messages`,
        messageData,
        {
          params: {
            access_token: this.pageAccessToken
          }
        }
      );

      console.log('Media message sent successfully:', response.data);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { message?: string } } }; message?: string };
      console.error('Error sending media message:', err.response?.data || err.message);
      throw new Error(`Failed to send media message: ${err.response?.data?.error?.message || err.message}`);
    }
  }

  // Send multiple media attachments (images only, max 30)
  async sendMultipleMediaMessage(recipientId: string, attachments: MessageAttachment[], options: MessageOptions = {}): Promise<MessageResponse> {
    try {
      if (attachments.length > 30) {
        throw new Error('Maximum 30 images allowed');
      }

      // Ensure all attachments are images
      const imageAttachments = attachments.filter(att => att.type === 'image');
      if (imageAttachments.length !== attachments.length) {
        throw new Error('Only image attachments are allowed for multiple media messages');
      }

      interface MultipleMediaData {
        recipient: { id: string };
        messaging_type: string;
        message: {
          attachments: MessageAttachment[];
        };
        message_tag?: string;
      }

      const messageData: MultipleMediaData = {
        recipient: { id: recipientId },
        messaging_type: options.messaging_type || 'RESPONSE',
        message: {
          attachments: imageAttachments
        }
      };

      // Add message tag if provided
      if (options.message_tag) {
        messageData.message_tag = options.message_tag;
      }

      const response = await axios.post<MessageResponse>(
        `${FACEBOOK_GRAPH_API_URL}/${this.pageId}/messages`,
        messageData,
        {
          params: {
            access_token: this.pageAccessToken
          }
        }
      );

      console.log('Multiple media message sent successfully:', response.data);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { message?: string } } }; message?: string };
      console.error('Error sending multiple media message:', err.response?.data || err.message);
      throw new Error(`Failed to send multiple media message: ${err.response?.data?.error?.message || err.message}`);
    }
  }

  // Send a generic template message
  async sendGenericTemplate(recipientId: string, template: GenericTemplate, options: MessageOptions = {}): Promise<MessageResponse> {
    try {
      interface TemplateMessageData {
        recipient: { id: string };
        messaging_type: string;
        message: {
          attachment: {
            type: string;
            payload: GenericTemplate;
          };
        };
        message_tag?: string;
      }

      const messageData: TemplateMessageData = {
        recipient: { id: recipientId },
        messaging_type: options.messaging_type || 'RESPONSE',
        message: {
          attachment: {
            type: 'template',
            payload: template
          }
        }
      };

      // Add message tag if provided
      if (options.message_tag) {
        messageData.message_tag = options.message_tag;
      }

      const response = await axios.post<MessageResponse>(
        `${FACEBOOK_GRAPH_API_URL}/${this.pageId}/messages`,
        messageData,
        {
          params: {
            access_token: this.pageAccessToken
          }
        }
      );

      console.log('Template message sent successfully:', response.data);
      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { message?: string } } }; message?: string };
      console.error('Error sending template message:', err.response?.data || err.message);
      throw new Error(`Failed to send template message: ${err.response?.data?.error?.message || err.message}`);
    }
  }

  // Send sender action (typing, mark seen)
  async sendSenderAction(recipientId: string, action: 'typing_on' | 'typing_off' | 'mark_seen'): Promise<boolean> {
    try {
      await axios.post(
        `${FACEBOOK_GRAPH_API_URL}/${this.pageId}/messages`,
        {
          recipient: { id: recipientId },
          sender_action: action
        },
        {
          params: {
            access_token: this.pageAccessToken
          }
        }
      );

      return true;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { message?: string } } }; message?: string };
      console.error('Error sending sender action:', err.response?.data || err.message);
      return false;
    }
  }

  // Mark a message as read
  async markMessageAsRead(senderId: string): Promise<boolean> {
    return this.sendSenderAction(senderId, 'mark_seen');
  }

  // Show typing indicator
  async showTyping(recipientId: string): Promise<boolean> {
    return this.sendSenderAction(recipientId, 'typing_on');
  }

  // Hide typing indicator
  async hideTyping(recipientId: string): Promise<boolean> {
    return this.sendSenderAction(recipientId, 'typing_off');
  }

  // Get user profile information
  async getUserProfile(userId: string, fields: string[] = ['first_name', 'last_name', 'profile_pic']): Promise<UserProfile> {
    try {
      const response = await axios.get<UserProfile>(
        `${FACEBOOK_GRAPH_API_URL}/${userId}`,
        {
          params: {
            access_token: this.pageAccessToken,
            fields: fields.join(',')
          }
        }
      );

      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { message?: string } } }; message?: string };
      console.error('Error fetching user profile:', err.response?.data || err.message);
      return { first_name: 'Unknown', last_name: 'User' };
    }
  }

  // Upload attachment to reuse later
  async uploadAttachment(url: string, type: 'image' | 'audio' | 'video' | 'file'): Promise<string> {
    try {
      interface UploadResponse {
        attachment_id: string;
      }

      const response = await axios.post<UploadResponse>(
        `${FACEBOOK_GRAPH_API_URL}/${this.pageId}/message_attachments`,
        {
          message: {
            attachment: {
              type: type,
              payload: {
                url: url,
                is_reusable: true
              }
            }
          }
        },
        {
          params: {
            access_token: this.pageAccessToken
          }
        }
      );

      return response.data.attachment_id;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { message?: string } } }; message?: string };
      console.error('Error uploading attachment:', err.response?.data || err.message);
      throw new Error(`Failed to upload attachment: ${err.response?.data?.error?.message || err.message}`);
    }
  }

  // Get Instagram messages (using Instagram Messaging API)
  async getInstagramMessages(limit: number = 25): Promise<Array<FacebookMessage & { conversationId: string; platform: string }>> {
    try {
      const response = await axios.get<{ data: FacebookConversation[] }>(
        `${FACEBOOK_GRAPH_API_URL}/${this.pageId}/conversations`,
        {
          params: {
            access_token: this.pageAccessToken,
            platform: 'instagram',
            fields: 'id,messages{id,message,from,to,created_time,attachments}',
            limit
          }
        }
      );

      const conversations = response.data.data || [];
      const messages = conversations.flatMap((conv: FacebookConversation) => 
        conv.messages?.data?.map(msg => ({
          ...msg,
          conversationId: conv.id,
          platform: 'instagram'
        })) || []
      );

      return messages;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { message?: string } } }; message?: string };
      console.error('Error fetching Instagram messages:', err.response?.data || err.message);
      throw new Error(`Failed to fetch Instagram messages: ${err.response?.data?.error?.message || err.message}`);
    }
  }

  // Send Instagram message
  async sendInstagramMessage(recipientId: string, message: string, options: MessageOptions = {}): Promise<MessageResponse> {
    // Instagram messaging uses the same API as Messenger but with different permissions
    return this.sendMessage(recipientId, message, options);
  }

  // Verify webhook
  static verifyWebhook(mode: string, token: string, challenge: string): string | null {
    const VERIFY_TOKEN = process.env.FACEBOOK_VERIFY_TOKEN;
    
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      return challenge;
    }
    
    return null;
  }

  // Create quick reply buttons
  static createQuickReplies(options: Array<{title: string, payload: string, imageUrl?: string}>): QuickReply[] {
    return options.map(option => ({
      content_type: 'text',
      title: option.title,
      payload: option.payload,
      image_url: option.imageUrl
    }));
  }

  // Create generic template
  static createGenericTemplate(elements: Array<{
    title: string;
    subtitle?: string;
    imageUrl?: string;
    defaultAction?: {url: string};
    buttons?: Array<{type: 'web_url' | 'postback', title: string, url?: string, payload?: string}>;
  }>): GenericTemplate {
    return {
      template_type: 'generic',
      elements: elements.map(element => ({
        title: element.title,
        subtitle: element.subtitle,
        image_url: element.imageUrl,
        default_action: element.defaultAction ? {
          type: 'web_url',
          url: element.defaultAction.url
        } : undefined,
        buttons: element.buttons
      }))
    };
  }
} 