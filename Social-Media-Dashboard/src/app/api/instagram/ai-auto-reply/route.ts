import { NextRequest, NextResponse } from 'next/server';
import { InstagramMessageService } from '@/lib/instagramMessageService';
import { InstagramAPI } from '@/lib/instagramApi';

// POST - Process AI auto-reply for unreplied Instagram messages
export async function POST(request: NextRequest) {
  try {
    console.log('🤖 Starting Instagram AI auto-reply process...');

    // Get all unreplied messages from our database
    const unrepliedMessages = await InstagramMessageService.getUnrepliedMessages();
    
    if (unrepliedMessages.length === 0) {
      console.log('✅ No unreplied Instagram messages found');
      return NextResponse.json({
        success: true,
        message: 'No unreplied Instagram messages to process',
        processedCount: 0
      });
    }

    console.log(`📊 Found ${unrepliedMessages.length} unreplied Instagram messages`);

    // Get Instagram API credentials
    let accessToken = process.env.INSTAGRAM_ACCESS_TOKEN || 
                      process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
    let instagramBusinessAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;

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
        message: 'Instagram Access Token and Business Account ID are required for AI auto-reply'
      }, { status: 400 });
    }

    // Initialize Instagram API
    const instagramApi = new InstagramAPI(accessToken, instagramBusinessAccountId, false);

    // N8N Webhook URL for AI responses
    const n8nWebhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
    
    if (!n8nWebhookUrl) {
      console.warn('⚠️ N8N webhook URL not configured, using fallback AI responses');
    }

    let processedCount = 0;
    const errors: string[] = [];

    // Process each unreplied message
    for (const message of unrepliedMessages) {
      try {
        console.log(`🔄 Processing Instagram message ${message.message_id} from ${message.sender_name}`);

        // Filter out messages from the page itself (avoid responding to our own messages)
        if (message.sender_id === instagramBusinessAccountId) {
          console.log(`⏭️ Skipping message from business account (${message.sender_id})`);
          continue;
        }

        let aiReply = '';

        if (n8nWebhookUrl && message.message_text) {
          // Send to N8N webhook for AI response
          try {
            console.log('🧠 Sending to N8N webhook for AI response...');
            const n8nResponse = await fetch(n8nWebhookUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                message: message.message_text,
                sender: message.sender_name,
                platform: 'instagram',
                conversationId: message.conversation_id,
                messageId: message.message_id
              }),
            });

            if (n8nResponse.ok) {
              const n8nResult = await n8nResponse.json();
              aiReply = n8nResult.response || n8nResult.reply || '';
              console.log('✅ Received AI response from N8N');
            } else {
              throw new Error(`N8N webhook failed: ${n8nResponse.status}`);
            }
          } catch (n8nError) {
            console.warn('⚠️ N8N webhook failed, using fallback response:', n8nError);
            aiReply = 'Thank you for your message! We appreciate your interest in OfinaPulse. Our team will get back to you as soon as possible. 😊';
          }
        } else {
          // Fallback AI response
          console.log('💬 Using fallback AI response');
          aiReply = 'Thank you for your message! We appreciate your interest in OfinaPulse. Our team will get back to you as soon as possible. 😊';
        }

        if (aiReply) {
          // Send the AI reply via Instagram API
          const sendResult = await instagramApi.sendMessage(message.sender_id, aiReply);

          if (sendResult.success && sendResult.messageId) {
            console.log(`✅ AI reply sent successfully to ${message.sender_name}`);

            // Store the sent AI reply in our database
            try {
              const sentMessage = {
                id: sendResult.messageId,
                from: {
                  id: instagramBusinessAccountId,
                  username: 'OfinaPulse' // This will be identified by the business account ID
                },
                to: {
                  id: message.sender_id
                },
                created_time: new Date().toISOString(),
                text: aiReply,
                attachments: []
              };

              await InstagramMessageService.storeMessage(sentMessage, message.conversation_id);
              
              // Mark the original message as replied
              await InstagramMessageService.markMessageAsReplied(
                message.message_id,
                'AI',
                sendResult.messageId
              );

              processedCount++;
              console.log(`✅ Message ${message.message_id} marked as replied by AI`);
            } catch (storeError) {
              console.warn('⚠️ Failed to store AI reply or mark as replied:', storeError);
              errors.push(`Failed to store AI reply for message ${message.message_id}: ${storeError}`);
            }
          } else {
            const errorMsg = `Failed to send AI reply to ${message.sender_name}: ${sendResult.error}`;
            console.error('❌', errorMsg);
            errors.push(errorMsg);
          }
        } else {
          const errorMsg = `No AI reply generated for message ${message.message_id}`;
          console.warn('⚠️', errorMsg);
          errors.push(errorMsg);
        }

      } catch (messageError) {
        const errorMsg = `Error processing message ${message.message_id}: ${messageError}`;
        console.error('❌', errorMsg);
        errors.push(errorMsg);
      }
    }

    console.log(`🎯 Instagram AI auto-reply process completed. Processed: ${processedCount}/${unrepliedMessages.length}`);

    return NextResponse.json({
      success: true,
      message: 'Instagram AI auto-reply process completed',
      processedCount,
      totalMessages: unrepliedMessages.length,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('❌ Instagram AI auto-reply process failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'AI auto-reply process failed',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
      processedCount: 0
    }, { status: 500 });
  }
}

// GET - Check AI auto-reply status
export async function GET(request: NextRequest) {
  try {
    const unrepliedMessages = await InstagramMessageService.getUnrepliedMessages();
    const counts = await InstagramMessageService.getCounts();

    return NextResponse.json({
      success: true,
      data: {
        unrepliedCount: unrepliedMessages.length,
        totalMessages: counts.totalMessages,
        totalConversations: counts.totalConversations,
        readyForAiReply: unrepliedMessages.filter(m => 
          m.sender_id !== '17841475533389585' && // Not from business account
          m.message_text && 
          m.message_text.trim().length > 0
        ).length
      }
    });
  } catch (error) {
    console.error('❌ Error checking Instagram AI auto-reply status:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to check AI auto-reply status',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
} 