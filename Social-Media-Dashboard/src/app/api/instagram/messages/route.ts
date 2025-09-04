import { NextRequest, NextResponse } from 'next/server';
import { InstagramAPI } from '@/lib/instagramApi';
import { InstagramMessageService, StoredInstagramMessage } from '@/lib/instagramMessageService';
import { instagramSyncService } from '@/lib/instagramSyncService';

interface InstagramMessage {
  id: string;
  from: {
    id: string;
    username?: string;
  };
  to: {
    id: string;
  };
  created_time: string;
  text?: string;
  attachments?: Array<{
    type: string;
    url?: string;
    payload?: {
      url?: string;
    };
  }>;
}

interface InstagramConversation {
  id: string;
  participants: Array<{
    id: string;
    username?: string;
  }>;
  updated_time: string;
  message_count?: number;
  messages?: {
    data: InstagramMessage[];
  };
}

// GET - Fetch Instagram messages using Messenger API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // let accessToken = "EAAUzRdpHd2IBPPF7EVuijIMPrBNCiwwt3CWhbVOMDlXqZCcTWyiwYACj734nRlMBtcrw8rIfxdQHHngfcKfO2PNESB5dfJBsZASOPr0VTBsMZAhbAupzf1gBZCpB8L55Jh4YBRrOR0FiX89HH8UU03Pm0JGgcZAB7CoNIBbA91jVlR3unODW9SWesJT6M6Q9mWXMpCckwZAgZDZD";
    // let instagramBusinessAccountId = "17841406921663723";
    let accessToken = "EAAO4h7vKgcABO2QtAl4mniiMQOoNuyZCn3FPuLwDR3AnaqIijuOj1O21zTAfIQfinlHLWdNiSUyyelsU8LQJsSYyue4H3fF7MZCdfr0yjHWgzqbSBVHtnqcE28lG8RGJcTMUEIHYj11fk5LHnV3rQiVIrC4BYzZAyhrmTFZCuiAtvr3BwL4pv0pX2l9GIZCUjwGXPN8m66gZDZD";
    let instagramBusinessAccountId = "17841475533389585";
    const conversationId = searchParams.get('conversationId');
    const limit = parseInt(searchParams.get('limit') || '25');
    const useNewApi = searchParams.get('useNewApi') === 'true';  // Default to false

    // You can uncomment this to use environment variables instead
    /* if (!accessToken || !instagramBusinessAccountId) {
      accessToken = process.env.INSTAGRAM_ACCESS_TOKEN || null;
      instagramBusinessAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID || null;
    } */

    if (!accessToken || !instagramBusinessAccountId) {
      return NextResponse.json({
        success: false, 
        error: 'Instagram Access Token and Business Account ID are required',
        instructions: [
          'Set INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_BUSINESS_ACCOUNT_ID environment variables',
          'Or provide accessToken and instagramBusinessAccountId as query parameters',
          'Use /api/instagram/auth to authenticate and get tokens'
        ]
      }, { status: 400 });
    }

    // Trigger background sync in parallel (don't await this)
    triggerBackgroundSync(accessToken, instagramBusinessAccountId);

    console.log('Creating Instagram API client with useNewApi:', useNewApi);
    const instagramApi = new InstagramAPI(accessToken, instagramBusinessAccountId, useNewApi);

    if (conversationId) {
      // Get messages from specific conversation using our service first
      try {
        const storedMessages = await InstagramMessageService.getConversationMessages(conversationId);
        
        if (storedMessages.length > 0) {
          // Return stored messages
          return NextResponse.json({
            success: true,
            source: 'database',
            data: {
              conversationId,
              messages: storedMessages.map(msg => ({
                id: msg.message_id,
                platform: 'instagram',
                senderId: msg.sender_id,
                senderName: msg.sender_name,
                content: {
                  text: msg.message_text || '',
                  attachments: msg.attachments || []
                },
                timestamp: msg.timestamp,
                isReplied: msg.is_replied,
                repliedBy: msg.replied_by,
                messageType: (msg.attachments?.length || 0) > 0 ? 'media' : 'text'
              })),
              syncTriggered: true // Indicate that background sync was triggered
            }
          });
        }
      } catch (dbError) {
        console.warn('Failed to fetch from database, falling back to API:', dbError);
      }

      // Fallback to API if no stored messages
      const messages = await instagramApi.getMessages(conversationId, limit);
      
      // Store the fetched messages
      try {
        if (messages.length > 0) {
          await InstagramMessageService.storeMessages(messages, conversationId);
        }
      } catch (storeError) {
        console.warn('Failed to store Instagram messages:', storeError);
      }
      
      return NextResponse.json({
        success: true,
        source: 'api',
        data: {
          conversationId,
          messages: messages.map(msg => ({
            id: msg.id,
            platform: 'instagram',
            senderId: msg.from.id,
            senderName: msg.from.username || 'Instagram User',
            content: {
              text: msg.text || '',
              attachments: msg.attachments || []
            },
            timestamp: msg.created_time,
            messageType: (msg.attachments?.length || 0) > 0 ? 'media' : 'text'
          })),
          syncTriggered: true // Indicate that background sync was triggered
        }
      });
    } else {
      console.log('Fetching all Instagram conversations...');
      
      // First try to get conversations from our database
      try {
        const storedConversations = await InstagramMessageService.getConversations();
        
        if (storedConversations.length > 0) {
          console.log(`Found ${storedConversations.length} Instagram conversations in database`);
          
          // Flatten all messages from stored conversations
          const allMessages: any[] = [];
          
          for (const conv of storedConversations) {
            for (const msg of conv.messages) {
              allMessages.push({
                id: msg.message_id,
                platform: 'instagram',
                senderId: msg.sender_id,
                senderName: msg.sender_name,
                recipientId: msg.receipt_id,
                content: {
                  text: msg.message_text || '',
                  attachments: msg.attachments || []
                },
                timestamp: msg.timestamp,
                conversationId: msg.conversation_id,
                isRead: msg.is_replied,
                isReplied: msg.is_replied,
                status: msg.is_replied ? 'replied' : 'new',
                hasAttachments: (msg.attachments?.length || 0) > 0,
                messageType: (msg.attachments?.length || 0) > 0 ? 'media' : 'text'
              });
            }
          }
          
          // Sort by timestamp (newest first)
          allMessages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          
          return NextResponse.json({
            success: true,
            source: 'database',
            data: {
              messages: allMessages,
              conversations: storedConversations.map(conv => ({
                id: conv.conversationId,
                participants: conv.participants,
                lastMessage: conv.lastMessage,
                unreadCount: conv.unreadCount,
                isReplied: conv.isReplied,
                messages: conv.messages // Include messages in conversation object
              })),
              pagination: {
                totalCount: allMessages.length,
                limit: limit
              },
              stats: {
                totalMessages: allMessages.length,
                unreadMessages: allMessages.filter(m => m.status === 'new').length,
                totalConversations: storedConversations.length,
                instagramOnly: true
              },
              syncTriggered: true // Indicate that background sync was triggered
            }
          });
        }
      } catch (dbError) {
        console.warn('Failed to fetch conversations from database, falling back to API:', dbError);
      }

      // Fallback to API if no stored conversations
      const conversations = await instagramApi.getConversations(limit);
      console.log(`Found ${conversations.length} Instagram conversations from API`);
      
      // Flatten all messages from all conversations
      const allMessages: any[] = [];
      
      // If no conversations found, return empty result
      if (conversations.length === 0) {
        console.log('No Instagram conversations available');
        return NextResponse.json({
          success: true,
          source: 'instagram-api',
          data: {
            messages: [],
            pagination: {
              totalCount: 0,
              limit: limit
            },
            stats: {
              totalMessages: 0,
              unreadMessages: 0,
              instagramOnly: true
            },
            info: "No Instagram conversations found. This could be because there are no active conversations with this Instagram account or because messaging is not enabled for this account."
          }
        });
      }
      
      // Fetch messages for each conversation
      const conversationPromises = conversations.map(async (conv) => {
        try {
          console.log(`Fetching messages for conversation ${conv.id}...`);
          const messages = await instagramApi.getMessages(conv.id, 10); // Limit messages per conversation
          console.log(`Found ${messages.length} messages in conversation ${conv.id}`);
          
          // Store the fetched messages in our database
          try {
            if (messages.length > 0) {
              await InstagramMessageService.storeMessages(messages, conv.id);
            }
          } catch (storeError) {
            console.warn(`Failed to store messages for conversation ${conv.id}:`, storeError);
          }
          
          return { conversation: conv, messages };
        } catch (error) {
          console.warn(`Failed to fetch messages for conversation ${conv.id}:`, error);
          return { conversation: conv, messages: [] };
        }
      });
      
      const conversationResults = await Promise.all(conversationPromises);
      
      for (const { conversation, messages } of conversationResults) {
        for (const msg of messages) {
          allMessages.push({
            id: msg.id,
            platform: 'instagram',
            senderId: msg.from.id,
            senderName: msg.from.username || 'Instagram User',
            recipientId: conversation.id,
            content: {
              text: msg.text || '',
              attachments: msg.attachments || []
            },
            timestamp: msg.created_time,
            conversationId: conversation.id,
            isRead: false, // You can implement read status logic
            isReplied: false,
            status: 'new',
            hasAttachments: (msg.attachments?.length || 0) > 0,
            messageType: (msg.attachments?.length || 0) > 0 ? 'media' : 'text'
          });
        }
      }
      
      // Sort by timestamp (newest first)
      allMessages.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      return NextResponse.json({
        success: true,
        source: 'instagram-api',
        data: {
          messages: allMessages,
          pagination: {
            totalCount: allMessages.length,
            limit: limit
          },
          stats: {
            totalMessages: allMessages.length,
            unreadMessages: allMessages.filter(m => m.status === 'new').length,
            instagramOnly: true
          }
        }
      });
    }
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Instagram messages API error:', error);
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}

// POST - Send Instagram message using Messenger API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      recipientId, 
      message, 
      messageType = 'text',
      accessToken: bodyAccessToken, 
      instagramBusinessAccountId: bodyInstagramId 
    } = body;

    if (!recipientId) {
      return NextResponse.json(
        { success: false, message: 'Recipient ID is required' },
        { status: 400 }
      );
    }

    if (!message && messageType === 'text') {
      return NextResponse.json(
        { success: false, message: 'Message text is required' },
        { status: 400 }
      );
    }

    // Fallback values for local testing (same as GET handler)
    let accessToken = bodyAccessToken || process.env.INSTAGRAM_ACCESS_TOKEN || process.env.FACEBOOK_PAGE_ACCESS_TOKEN || null;
    let instagramBusinessAccountId = bodyInstagramId || process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID || null;

    if (!accessToken || !instagramBusinessAccountId) {
      // Hard-coded test credentials – REMOVE these in production
      accessToken = "EAAO4h7vKgcABO2QtAl4mniiMQOoNuyZCn3FPuLwDR3AnaqIijuOj1O21zTAfIQfinlHLWdNiSUyyelsU8LQJsSYyue4H3fF7MZCdfr0yjHWgzqbSBVHtnqcE28lG8RGJcTMUEIHYj11fk5LHnV3rQiVIrC4BYzZAyhrmTFZCuiAtvr3BwL4pv0pX2l9GIZCUjwGXPN8m66gZDZD";
      instagramBusinessAccountId = "17841475533389585";
    }

    // Use Facebook Graph API endpoint for sending messages. graph.instagram.com does not support /messages
    const instagramApi = new InstagramAPI(accessToken, instagramBusinessAccountId, false);
    
    try {
      console.log('📤 Attempting to send Instagram message via Graph API v23...');
      const result = await instagramApi.sendMessage(recipientId, message);
      
      if (result.success) {
        return NextResponse.json({
          success: true,
          message: 'Instagram message sent successfully',
          data: {
            messageId: result.messageId,
            recipientId: recipientId,
            platform: 'instagram'
          }
        });
      } else {
        console.error('❌ Instagram API returned failure:', result);
        
        // Provide specific guidance for OAuth errors
        if (result.error?.includes('capability') || result.error?.includes('OAuth')) {
          return NextResponse.json({
            success: false,
            error: 'App Permission Error',
            message: result.error,
            instructions: [
              'Your Facebook App needs pages_messaging permission for Instagram messaging',
              'Go to Facebook Developers Console → App Review → Request pages_messaging permission',
              'Complete Business Verification if required',
              'Ensure Instagram Business Account is connected to Facebook Page',
              'Regenerate access token after permissions are approved',
              'Run fix-instagram-oauth.js for detailed setup guide'
            ]
          }, { status: 403 });
        }
        
        throw new Error(result.error || 'Failed to send Instagram message');
      }
    } catch (sendError: unknown) {
      const errorMessage = sendError instanceof Error ? sendError.message : 'Unknown error';
      console.error('Error sending Instagram message:', sendError);
      return NextResponse.json({
        success: false,
        error: 'Failed to send Instagram message',
        details: errorMessage
      }, { status: 500 });
    }
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Instagram send message API error:', error);
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}

// PUT - Mark Instagram message as read
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { messageId, action = 'mark_read' } = body;

    if (!messageId) {
      return NextResponse.json(
        { success: false, message: 'Message ID is required' },
        { status: 400 }
      );
    }

    // For now, just return success since Instagram API doesn't have a direct mark-as-read endpoint
    // You can implement this with your own database tracking
    return NextResponse.json({
      success: true,
      message: `Instagram message ${action} successfully`,
      data: {
        messageId,
        action,
        platform: 'instagram'
      }
    });
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Instagram mark read API error:', error);
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}

// Background sync function that doesn't block the response (like Facebook)
async function triggerBackgroundSync(accessToken: string, instagramBusinessAccountId: string) {
  try {
    console.log('🔄 Triggering Instagram background sync...');
    
    if (!accessToken || !instagramBusinessAccountId) {
      console.warn('Instagram credentials not configured for background sync');
      return;
    }

    // Initialize Instagram sync service if not already done
    instagramSyncService.initialize(accessToken, instagramBusinessAccountId, false);

    // Trigger sync without waiting for completion (non-blocking)
    instagramSyncService.syncMessages().catch(error => {
      console.error('Background Instagram sync failed:', error);
      // Don't throw error as this is background operation
    });

    console.log('✅ Background Instagram sync triggered');
  } catch (error) {
    console.error('Failed to trigger Instagram background sync:', error);
    // Don't throw error as this shouldn't fail the main request
  }
}