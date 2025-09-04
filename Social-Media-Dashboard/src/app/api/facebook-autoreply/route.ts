import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { FacebookAPI } from '@/lib/facebookApi';
import { FacebookSyncService } from '@/lib/facebookSyncService';
import { FacebookMessageService } from '@/lib/facebookMessageService';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Facebook page configurations
const FACEBOOK_PAGES = [
  {
    id: process.env.FACEBOOK_PAGE_ID || "381898425500628",
    name: "Smile Experts Dental",
    accessToken: process.env.FACEBOOK_PAGE_ACCESS_TOKEN
  },
  {
    id: process.env.SECOND_FACEBOOK_PAGE_ID || "274759011056987",
    name: "Smile Experts Dental (Dental Office, Washington, DC)",
    accessToken: process.env.SECOND_FACEBOOK_ACCESS_TOKEN
  }
];

// N8N Webhook URL from environment
const n8nWebhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;

export async function GET(request: NextRequest) {
  try {
    console.log('Facebook auto-reply API called - starting sync and processing...');

    // Initialize Facebook sync service and perform sync
    const facebookSyncService = FacebookSyncService.getInstance();
    facebookSyncService.initializeAllPages();
    
    // Perform sync to get latest messages from Facebook Graph API
    console.log('Syncing Facebook messages from Graph API...');
    await facebookSyncService.syncMessages();
    console.log('Facebook sync completed');

    // Get unreplied messages from the last 10 minutes
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    
    const { data: unrepliedMessages, error } = await supabase
      .from('facebook_messages')
      .select('*')
      .eq('is_replied', false)
      .gte('timestamp', tenMinutesAgo)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Error fetching unreplied messages:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch unreplied messages',
        message: error.message
      }, { status: 500 });
    }

    if (!unrepliedMessages || unrepliedMessages.length === 0) {
      console.log('No unreplied messages found in the last 10 minutes');
      return NextResponse.json({
        success: true,
        message: 'No unreplied messages found',
        processedCount: 0,
        syncCompleted: true
      });
    }

    console.log(`Found ${unrepliedMessages.length} unreplied messages to process`);

    let processedCount = 0;
    const results = [];

    // Group messages by conversation to avoid duplicate processing
    const conversationMap = new Map();
    
    unrepliedMessages.forEach(message => {
      if (!conversationMap.has(message.conversation_id)) {
        conversationMap.set(message.conversation_id, []);
      }
      conversationMap.get(message.conversation_id).push(message);
    });

    // Process each conversation
    for (const [conversationId, messages] of conversationMap) {
      try {
        // Get the complete conversation to check the actual last message
        const { data: conversationMessages, error: convError } = await supabase
          .from('facebook_messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('timestamp', { ascending: true });

        if (convError) {
          console.error(`Error fetching conversation ${conversationId}:`, convError);
          continue;
        }

        if (!conversationMessages || conversationMessages.length === 0) {
          console.log(`No messages found for conversation ${conversationId}`);
          continue;
        }

        // Get the actual last message in the conversation
        const actualLastMessage = conversationMessages[conversationMessages.length - 1];
        
        // Check if the LAST message in the conversation is from customer (not from any Facebook page)
        // This is the key check - we only reply if the customer sent the last message
        const isLastMessageFromCustomer = !FACEBOOK_PAGES.some(page => page.id === actualLastMessage.sender_id);
        
        if (!isLastMessageFromCustomer) {
          console.log(`Skipping conversation ${conversationId} - last message is from page: ${actualLastMessage.sender_id}`);
          continue;
        }

        // Check if the actual last message is already replied
        if (actualLastMessage.is_replied) {
          console.log(`Last message ${actualLastMessage.message_id} in conversation ${conversationId} already replied, skipping`);
          continue;
        }

        // Check if message is recent (within last 10 minutes) to avoid replying to old messages
        const messageTime = new Date(actualLastMessage.timestamp).getTime();
        const now = new Date().getTime();
        const tenMinutesAgo = now - (10 * 60 * 1000);
        
        if (messageTime < tenMinutesAgo) {
          console.log(`Message ${actualLastMessage.message_id} is too old (${new Date(messageTime).toISOString()}), skipping auto-reply`);
          continue;
        }

        console.log(`Processing auto-reply for conversation ${conversationId}:`, {
          messageId: actualLastMessage.message_id,
          senderId: actualLastMessage.sender_id,
          senderName: actualLastMessage.sender_name,
          content: actualLastMessage.message_text,
          timestamp: actualLastMessage.timestamp,
          isReplied: actualLastMessage.is_replied
        });

        // Send to N8N webhook for AI processing
        const aiReply = await sendToN8nWebhook(actualLastMessage, conversationId);
        
        if (aiReply && aiReply.trim()) {
          // Find the appropriate page to send the reply from
          const targetPage = FACEBOOK_PAGES.find(page => page.accessToken && page.id);
          
          if (!targetPage) {
            console.error('No Facebook page configured with access token');
            continue;
          }

          // Send the AI reply
          const success = await sendFacebookReply(
            actualLastMessage.sender_id, 
            aiReply, 
            conversationId, 
            targetPage
          );

          if (success.success) {
            // Mark message as replied
            await markMessageAsReplied(actualLastMessage.message_id, 'AI', success.messageId);
            processedCount++;
            
            results.push({
              conversationId,
              messageId: actualLastMessage.message_id,
              aiReply,
              sent: true,
              replyMessageId: success.messageId
            });
            
            console.log(`Successfully sent AI reply to conversation ${conversationId}`);
          } else {
            console.error(`Failed to send AI reply to conversation ${conversationId}`);
            results.push({
              conversationId,
              messageId: actualLastMessage.message_id,
              aiReply,
              sent: false,
              error: 'Failed to send reply'
            });
          }
        } else {
          console.log(`No AI reply received for conversation ${conversationId}`);
          results.push({
            conversationId,
            messageId: actualLastMessage.message_id,
            aiReply: null,
            sent: false,
            error: 'No AI reply received'
          });
        }

      } catch (conversationError) {
        console.error(`Error processing conversation ${conversationId}:`, conversationError);
        results.push({
          conversationId,
          messageId: messages[messages.length - 1]?.message_id,
          sent: false,
          error: conversationError instanceof Error ? conversationError.message : 'Unknown error'
        });
      }
    }

    console.log(`Auto-reply processing completed. Processed ${processedCount} messages.`);

    return NextResponse.json({
      success: true,
      message: `Processed ${processedCount} auto-replies`,
      processedCount,
      totalMessages: unrepliedMessages.length,
      syncCompleted: true,
      results
    });

  } catch (error) {
    console.error('Error in Facebook auto-reply API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Send message to N8N webhook
async function sendToN8nWebhook(message: any, conversationId: string): Promise<string> {
  if (!n8nWebhookUrl) {
    throw new Error('N8N webhook URL not configured. Please set NEXT_PUBLIC_N8N_WEBHOOK_URL in your environment variables.');
  }

  try {
    console.log('Sending to N8N webhook:', {
      messageId: message.message_id,
      platform: 'facebook',
      senderId: message.sender_id,
      senderName: message.sender_name,
      content: message.message_text,
      timestamp: message.timestamp,
      conversationId: conversationId
    });

    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messageId: message.message_id,
        platform: 'facebook',
        senderId: message.sender_id,
        senderName: message.sender_name,
        content: message.message_text,
        timestamp: message.timestamp,
        conversationId: conversationId
      }),
    });

    if (!response.ok) {
      throw new Error(`N8N webhook failed: ${response.statusText}`);
    }

    // Check if response has content before parsing JSON
    const responseText = await response.text();
    console.log('N8N webhook raw response:', responseText);
    
    let result;
    if (responseText.trim()) {
      try {
        result = JSON.parse(responseText);
        console.log('N8N webhook parsed response:', result);
      } catch (parseError) {
        console.error('Error parsing N8N webhook response:', parseError);
        console.log('Response was not valid JSON, using default reply');
        return "Thank you for your message. We'll get back to you soon.";
      }
    } else {
      console.log('N8N webhook returned empty response, using default reply');
      return "Thank you for your message. We'll get back to you soon.";
    }
    
    return result.output || result.reply || "Thank you for your message. We'll get back to you soon.";
  } catch (error) {
    console.error('Error sending to N8N webhook:', error);
    throw error;
  }
}

// Send Facebook reply
async function sendFacebookReply(recipientId: string, message: string, conversationId: string, targetPage: any) {
  try {
    const facebookResponse = await fetch(`https://graph.facebook.com/v23.0/${targetPage.id}/messages?access_token=${targetPage.accessToken}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipient: { id: recipientId },
        messaging_type: 'RESPONSE',
        message: { text: message }
      })
    });

    const facebookData = await facebookResponse.json();

    if (!facebookResponse.ok) {
      throw new Error(facebookData.error?.message || 'Failed to send Facebook message');
    }

    // Store the sent message in database
    const sentMessage = {
      message_id: facebookData.message_id || `sent_${Date.now()}`,
      conversation_id: conversationId,
      sender_id: targetPage.id,
      sender_name: targetPage.name,
      receipt_id: recipientId,
      message_text: message,
      attachments: [],
      timestamp: new Date().toISOString(),
      platform: 'facebook',
      is_replied: true,
      replied_by: 'AI',
      reply_message_id: null
    };

    const { error } = await supabase
      .from('facebook_messages')
      .insert([sentMessage]);

    if (error) {
      console.error('Error storing sent message:', error);
    }

    return {
      success: true,
      messageId: facebookData.message_id
    };

  } catch (error) {
    console.error('Error sending Facebook message:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Mark message as replied
async function markMessageAsReplied(messageId: string, repliedBy: 'AI' | 'human', replyMessageId: string) {
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