import { NextRequest, NextResponse } from 'next/server';
import { InstagramAPI } from '@/lib/instagramApi';
import { InstagramMessageService } from '@/lib/instagramMessageService';

interface ReplyRequest {
  recipientId: string;
  message: string;
  conversationId?: string;
  replyToMessageId?: string;
  accessToken?: string;
  instagramBusinessAccountId?: string;
}

// POST - Send reply to Instagram message
export async function POST(request: NextRequest) {
  try {
    const body: ReplyRequest = await request.json();
    const { 
      recipientId, 
      message, 
      conversationId,
      replyToMessageId,
      accessToken: bodyAccessToken,
      instagramBusinessAccountId: bodyInstagramId 
    } = body;

    console.log('📨 Instagram reply request:', {
      recipientId,
      messageLength: message?.length,
      conversationId,
      replyToMessageId
    });

    // Validate required fields
    if (!recipientId) {
      return NextResponse.json(
        { success: false, message: 'Recipient ID is required' },
        { status: 400 }
      );
    }

    if (!message || message.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: 'Message text is required and cannot be empty' },
        { status: 400 }
      );
    }

    // Get credentials from multiple sources
    let accessToken = bodyAccessToken || 
                      process.env.INSTAGRAM_ACCESS_TOKEN || 
                      process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
    
    let instagramBusinessAccountId = bodyInstagramId || 
                                     process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;

    // Fallback to hardcoded values for testing (REMOVE in production)
    if (!accessToken || !instagramBusinessAccountId) {
      console.warn('⚠️ Using fallback credentials - REMOVE in production');
      accessToken = "EAAO4h7vKgcABO2QtAl4mniiMQOoNuyZCn3FPuLwDR3AnaqIijuOj1O21zTAfIQfinlHLWdNiSUyyelsU8LQJsSYyue4H3fF7MZCdfr0yjHWgzqbSBVHtnqcE28lG8RGJcTMUEIHYj11fk5LHnV3rQiVIrC4BYzZAyhrmTFZCuiAtvr3BwL4pv0pX2l9GIZCUjwGXPN8m66gZDZD";
      instagramBusinessAccountId = "17841475533389585";
    }

    if (!accessToken || !instagramBusinessAccountId) {
      return NextResponse.json({
        success: false, 
        error: 'Configuration missing',
        message: 'Instagram Access Token and Business Account ID are required',
        instructions: [
          'Set INSTAGRAM_ACCESS_TOKEN and INSTAGRAM_BUSINESS_ACCOUNT_ID environment variables',
          'Or provide accessToken and instagramBusinessAccountId in the request body',
          'Use /api/instagram/auth to authenticate and get tokens'
        ]
      }, { status: 400 });
    }

    console.log('🔧 Using Instagram credentials:', {
      hasAccessToken: !!accessToken,
      accessTokenLength: accessToken?.length,
      instagramBusinessAccountId
    });

    // Create Instagram API instance
    const instagramApi = new InstagramAPI(accessToken, instagramBusinessAccountId, false);
    
    try {
      // Attempt to send the reply
      console.log('📤 Sending Instagram reply...');
      const result = await instagramApi.sendMessage(recipientId, message.trim());
      
      if (result.success && result.messageId) {
        console.log('✅ Instagram reply sent successfully:', {
          messageId: result.messageId,
          recipientId,
          conversationId
        });

        // Store the sent message in our database
        try {
          const sentMessage = {
            id: result.messageId,
            from: {
              id: instagramBusinessAccountId,
              username: 'OfinaPulse' // This will be identified by the business account ID
            },
            to: {
              id: recipientId
            },
            created_time: new Date().toISOString(),
            text: message.trim(),
            attachments: []
          };

          await InstagramMessageService.storeMessage(sentMessage, conversationId || recipientId);
          console.log('✅ Sent Instagram message stored in database');
        } catch (storeError) {
          console.warn('⚠️ Failed to store sent Instagram message:', storeError);
          // Don't fail the API call if storing fails
        }

        return NextResponse.json({
          success: true,
          message: 'Instagram reply sent successfully',
          data: {
            messageId: result.messageId,
            recipientId: recipientId,
            conversationId: conversationId,
            platform: 'instagram',
            sentAt: new Date().toISOString()
          }
        });
      } else {
        console.error('❌ Instagram API returned failure:', result);
        throw new Error(result.error || 'Instagram API returned no success indicator');
      }
      
    } catch (sendError: unknown) {
      console.error('❌ Error sending Instagram reply:', sendError);
      
      const errorMessage = sendError instanceof Error ? sendError.message : 'Unknown error';
      
      // Check for common Instagram API errors
      if (errorMessage.includes('Invalid user ID') || errorMessage.includes('User not found')) {
        return NextResponse.json({
          success: false,
          error: 'Invalid recipient',
          message: 'The recipient ID is invalid or the user cannot receive messages',
          details: errorMessage
        }, { status: 400 });
      }
      
      if (errorMessage.includes('access_token') || errorMessage.includes('token') || errorMessage.includes('expired')) {
        return NextResponse.json({
          success: false,
          error: 'Authentication error',
          message: 'Instagram access token is invalid or expired',
          details: errorMessage,
          instructions: [
            'Refresh your Instagram access token',
            'Ensure the token has messaging permissions',
            'Check that the Instagram Business Account is connected to the Facebook Page'
          ]
        }, { status: 401 });
      }

      if (errorMessage.includes('permission') || errorMessage.includes('scope')) {
        return NextResponse.json({
          success: false,
          error: 'Permission error',
          message: 'Insufficient permissions to send Instagram messages',
          details: errorMessage,
          instructions: [
            'Ensure the access token has instagram_basic and pages_messaging permissions',
            'Verify the Instagram account is a Business Account',
            'Check that messaging is enabled for the Instagram account'
          ]
        }, { status: 403 });
      }

      // Generic error response
      return NextResponse.json({
        success: false,
        error: 'Send failed',
        message: 'Failed to send Instagram reply',
        details: errorMessage
      }, { status: 500 });
    }
    
  } catch (error: unknown) {
    console.error('❌ Instagram reply API error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    
    return NextResponse.json({
      success: false,
      error: 'Server error',
      message: 'An internal server error occurred',
      details: errorMessage
    }, { status: 500 });
  }
}

// GET - Get reply status or conversation info
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    const messageId = searchParams.get('messageId');
    
    if (!conversationId && !messageId) {
      return NextResponse.json(
        { success: false, message: 'Conversation ID or Message ID is required' },
        { status: 400 }
      );
    }

    // For now, return basic status
    // You can expand this to check message delivery status if needed
    return NextResponse.json({
      success: true,
      data: {
        conversationId,
        messageId,
        status: 'delivered', // This would need to be checked via Instagram API
        platform: 'instagram'
      }
    });
    
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Instagram reply status API error:', error);
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}
