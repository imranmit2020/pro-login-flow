import { NextRequest, NextResponse } from 'next/server';
import { FacebookAPI, FacebookConversation, MessageOptions } from '@/lib/facebookApi';
import { createFacebookAuthService } from '@/lib/facebookAuth';

interface MessageData {
  id: string;
  message?: string;
  from: { id: string; name: string };
  to: { data: Array<{ id: string; name: string }> };
  created_time: string;
  attachments?: { data: Array<{ type: string; url?: string; payload?: { url: string }; name?: string }> };
}

interface ConversationWithPlatform extends FacebookConversation {
  platform: 'messenger' | 'instagram';
}

// GET - Fetch Facebook and/or Instagram messages
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    let pageAccessToken = searchParams.get('pageAccessToken');
    let pageId = searchParams.get('pageId');
    const platform = searchParams.get('platform'); // 'messenger', 'instagram', or null for both
    const limit = parseInt(searchParams.get('limit') || '25');

    if (!pageAccessToken || !pageId) {
      pageAccessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN || null;
      pageId = process.env.FACEBOOK_PAGE_ID || null;
    }

    if (!pageAccessToken || !pageId) {
      return NextResponse.json({
        success: false, 
        error: 'Facebook Page Access Token and Page ID are required',
        instructions: [
          '1. Set FACEBOOK_PAGE_ACCESS_TOKEN and FACEBOOK_PAGE_ID environment variables',
          '2. Or provide pageAccessToken and pageId as query parameters',
          '3. Use /api/facebook/callback to get valid tokens through OAuth'
        ]
      }, { status: 400 });
    }

    try {
      const fbAuth = createFacebookAuthService();
      await fbAuth.verifyPageToken(pageAccessToken, pageId);
    } catch (tokenError: unknown) {
      const error = tokenError as Error;
      console.log('🔄 Token expired, falling back to webhook data...');
      
      // Fallback to webhook-stored messages when token expires
      try {
        const webhookUrl = `${request.nextUrl.origin}/api/facebook/webhook${platform ? `?platform=${platform}` : ''}`;
        const webhookResponse = await fetch(webhookUrl);
        const webhookResult = await webhookResponse.json();
        
        if (webhookResult.success) {
          return NextResponse.json({
            ...webhookResult,
            fallback: true,
            message: 'Using webhook data (API token expired)'
          });
        }
      } catch (webhookError) {
        console.error('❌ Webhook fallback also failed:', webhookError);
      }
      
      return NextResponse.json({
        success: false,
        error: 'Invalid Page Access Token',
        details: error.message,
        message: 'The provided Page Access Token is invalid or expired. Using webhook data instead.',
        suggestion: 'Configure webhook endpoint to receive real-time messages without token dependency.'
      }, { status: 401 });
    }

    const facebookApi = new FacebookAPI(pageAccessToken, pageId);
    let conversations: ConversationWithPlatform[] = [];

    if (platform === 'messenger' || !platform) {
      try {
        const messengerConversations = await facebookApi.getConversations(limit, 'messenger');
        conversations = conversations.concat(messengerConversations.map(conv => ({
          ...conv,
          platform: 'messenger' as const
        })));
      } catch (error: unknown) {
        const err = error as Error;
        console.error('Error fetching Messenger conversations:', err.message);
      }
    }

    if (platform === 'instagram' || !platform) {
      try {
        const instagramConversations = await facebookApi.getConversations(limit, 'instagram');
        conversations = conversations.concat(instagramConversations.map(conv => ({
          ...conv,
          platform: 'instagram' as const
        })));
      } catch (error: unknown) {
        const err = error as Error;
        console.error('Error fetching Instagram conversations:', err.message);
      }
    }

    // Transform conversations to a flat list of messages with enhanced information
    const messages = conversations.flatMap((conversation: ConversationWithPlatform) => 
      conversation.messages?.data?.map((message: MessageData) => ({
        id: message.id,
        platform: conversation.platform || 'facebook',
        senderId: message.from.id,
        senderName: message.from.name,
        recipientId: message.to.data[0]?.id,
        recipientName: message.to.data[0]?.name,
        content: {
          text: message.message || '',
          attachments: message.attachments?.data?.map((att: { type: string; url?: string; payload?: { url: string }; name?: string }) => ({
            type: att.type,
            url: att.url || att.payload?.url,
            name: att.name || 'Attachment'
          })) || []
        },
        timestamp: message.created_time,
        conversationId: conversation.id,
        isRead: false, // This would need more logic to determine
        isReplied: false, // This would need more logic to determine
        status: 'new', // This would need more logic to determine
        hasAttachments: (message.attachments?.data?.length || 0) > 0,
        messageType: (message.attachments?.data?.length || 0) > 0 ? 'media' : 'text'
      })) || []
    );

    // Sort messages by timestamp descending (newest first)
    messages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Calculate statistics
    const stats = {
      totalMessages: messages.length,
      messengerMessages: messages.filter(m => m.platform === 'messenger').length,
      instagramMessages: messages.filter(m => m.platform === 'instagram').length,
      unreadMessages: messages.filter(m => !m.isRead).length,
      messagesWithAttachments: messages.filter(m => m.hasAttachments).length
    };

    return NextResponse.json({
      success: true,
      data: {
        messages: messages,
        pagination: {
          totalCount: messages.length,
          limit: limit
        },
        stats: stats
      }
    }, { status: 200 });
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('Fetch messages error:', error);
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}

// POST - Send a reply message (supports text, media, templates)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      recipientId, 
      message, 
      messageType = 'text',
      attachment,
      attachments,
      template,
      quickReplies,
      messagingType = 'RESPONSE',
      messageTag,
      pageAccessToken: bodyPageToken, 
      pageId: bodyPageId 
    } = body;

    if (!recipientId) {
      return NextResponse.json(
        { success: false, message: 'Recipient ID is required' },
        { status: 400 }
      );
    }

    if (!message && !attachment && !attachments && !template) {
      return NextResponse.json(
        { success: false, message: 'Message content is required (text, attachment, or template)' },
        { status: 400 }
      );
    }

    // Try to get tokens from request body first, then environment
    const pageAccessToken = bodyPageToken || process.env.FACEBOOK_PAGE_ACCESS_TOKEN || null;
    const pageId = bodyPageId || process.env.FACEBOOK_PAGE_ID || null;

    if (!pageAccessToken || !pageId) {
      return NextResponse.json({
        success: false, 
        error: 'Facebook Page Access Token required',
        message: 'You need to provide Page Access Token and Page ID',
        instructions: [
          '1. Include pageAccessToken and pageId in request body, or',
          '2. Set FACEBOOK_PAGE_ACCESS_TOKEN and FACEBOOK_PAGE_ID environment variables',
          '3. Use OAuth flow at /api/facebook/callback to get valid tokens'
        ]
      }, { status: 400 });
    }

    // Verify token before using
    try {
      const fbAuth = createFacebookAuthService();
      await fbAuth.verifyPageToken(pageAccessToken, pageId);
    } catch (tokenError: unknown) {
      const error = tokenError as Error;
      return NextResponse.json({
        success: false,
        error: 'Invalid Page Access Token',
        details: error.message,
        message: 'The provided Page Access Token is invalid or expired'
      }, { status: 401 });
    }

    const facebookApi = new FacebookAPI(pageAccessToken, pageId);
    
    // Prepare message options
    const options: MessageOptions = {
      messaging_type: messagingType,
      ...(messageTag && { message_tag: messageTag }),
      ...(quickReplies && { quick_replies: quickReplies })
    };

    interface SendResult {
      message_id?: string;
      recipient_id?: string;
    }

    let result: SendResult;

    try {
      // Send typing indicator
      await facebookApi.showTyping(recipientId);

      switch (messageType) {
        case 'text':
          result = await facebookApi.sendMessage(recipientId, message, options);
          break;

        case 'media':
          if (attachment) {
            result = await facebookApi.sendMediaMessage(recipientId, attachment, options);
          } else {
            throw new Error('Attachment is required for media messages');
          }
          break;

        case 'multiple_media':
          if (attachments && Array.isArray(attachments)) {
            result = await facebookApi.sendMultipleMediaMessage(recipientId, attachments, options);
          } else {
            throw new Error('Attachments array is required for multiple media messages');
          }
          break;

        case 'template':
          if (template) {
            result = await facebookApi.sendGenericTemplate(recipientId, template, options);
          } else {
            throw new Error('Template is required for template messages');
          }
          break;

        default:
          result = await facebookApi.sendMessage(recipientId, message, options);
      }

      // Hide typing indicator
      await facebookApi.hideTyping(recipientId);
      
      return NextResponse.json({
        success: true,
        message: 'Message sent successfully',
        data: {
          messageId: result.message_id,
          recipientId: result.recipient_id,
          messageType: messageType
        }
      }, { status: 201 });
      
    } catch (sendError: unknown) {
      const error = sendError as Error;
      // Hide typing indicator on error
      await facebookApi.hideTyping(recipientId);
      throw error;
    }
    
  } catch (error: unknown) {
    const err = error as { message?: string; response?: { data?: { error?: string } } };
    console.error('Send message error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: err.message || 'Internal server error',
        error: err.response?.data?.error || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT - Mark message as read
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { senderId, pageAccessToken: bodyPageToken, pageId: bodyPageId } = body;

    if (!senderId) {
      return NextResponse.json(
        { success: false, message: 'Sender ID is required' },
        { status: 400 }
      );
    }

    const pageAccessToken = bodyPageToken || process.env.FACEBOOK_PAGE_ACCESS_TOKEN || null;
    const pageId = bodyPageId || process.env.FACEBOOK_PAGE_ID || null;

    if (!pageAccessToken || !pageId) {
      return NextResponse.json({
        success: false, 
        error: 'Facebook Page Access Token required'
      }, { status: 400 });
    }

    try {
      const fbAuth = createFacebookAuthService();
      await fbAuth.verifyPageToken(pageAccessToken, pageId);
    } catch (tokenError: unknown) {
      const error = tokenError as Error;
      return NextResponse.json({
        success: false,
        error: 'Invalid Page Access Token',
        details: error.message
      }, { status: 401 });
    }

    const facebookApi = new FacebookAPI(pageAccessToken, pageId);
    const success = await facebookApi.markMessageAsRead(senderId);
    
    return NextResponse.json({
      success: success,
      message: success ? 'Message marked as read' : 'Failed to mark message as read'
    }, { status: success ? 200 : 500 });
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('Mark as read error:', error);
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
} 