import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { facebookSyncService } from '@/lib/facebookSyncService';

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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '200'); // Increased to 200
    const conversationId = searchParams.get('conversationId');

    // Debug: Log configured pages
    console.log('Configured Facebook pages:', FACEBOOK_PAGES.map(p => ({ id: p.id, name: p.name, hasToken: !!p.accessToken })));

    // Build database query
    let query = supabase
      .from('facebook_messages')
      .select('*')
      .order('timestamp', { ascending: false });

    if (conversationId) {
      query = query.eq('conversation_id', conversationId);
    }

    if (limit) {
      query = query.limit(limit);
    }

    // Trigger background sync in parallel (don't await this)
    triggerBackgroundSync();

    // Execute database query
    const { data: messages, error } = await query;

    if (error) {
      console.error('Error fetching Facebook messages:', error);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch messages',
        message: error.message
      }, { status: 500 });
    }

    // Debug: Log message counts by page
    const messagesByPage = messages?.reduce((acc, msg) => {
      const page = FACEBOOK_PAGES.find(p => p.id === msg.sender_id || p.id === msg.receipt_id);
      const pageName = page?.name || 'Unknown';
      acc[pageName] = (acc[pageName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log('Messages by page:', messagesByPage);

    // Group messages by conversation_id to create threads
    const conversationMap = new Map();
    
    messages?.forEach(message => {
      const convId = message.conversation_id;
      if (!conversationMap.has(convId)) {
        conversationMap.set(convId, {
          conversationId: convId,
          messages: [],
          lastMessage: null,
          unreadCount: 0,
          isReplied: false,
          participants: new Set(),
          pageId: null,
          pageName: null
        });
      }
      
      const conversation = conversationMap.get(convId);
      conversation.messages.push(message);
      conversation.participants.add(message.sender_name);
      
      // Determine which page this message belongs to
      const page = FACEBOOK_PAGES.find(p => p.id === message.sender_id || p.id === message.receipt_id);
      if (page) {
        conversation.pageId = page.id;
        conversation.pageName = page.name;
      }
      
      // Update last message (most recent)
      if (!conversation.lastMessage || new Date(message.timestamp) > new Date(conversation.lastMessage.timestamp)) {
        conversation.lastMessage = message;
      }
      
      // Count unread messages (assuming messages from page are read)
      if (!message.is_replied && message.sender_id !== message.receipt_id) {
        conversation.unreadCount++;
      }
      
      // Check if conversation has been replied to
      if (message.is_replied) {
        conversation.isReplied = true;
      }
    });

    // Convert map to array and sort by last message timestamp
    const conversations = Array.from(conversationMap.values())
      .map(conv => ({
        ...conv,
        participants: Array.from(conv.participants),
        messages: conv.messages.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      }))
      .sort((a, b) => new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime());

    // Debug: Log conversation counts by page
    const conversationsByPage = conversations.reduce((acc, conv) => {
      const pageName = conv.pageName || 'Unknown';
      acc[pageName] = (acc[pageName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log('Conversations by page:', conversationsByPage);

    return NextResponse.json({
      success: true,
      data: {
        conversations,
        totalMessages: messages?.length || 0,
        syncTriggered: true // Indicate that background sync was triggered
      }
    });

  } catch (error) {
    console.error('Error in Facebook messages API:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recipientId, message, conversationId, pageId } = body;

    // Determine which page to use for sending
    const targetPage = pageId 
      ? FACEBOOK_PAGES.find(p => p.id === pageId)
      : FACEBOOK_PAGES[0]; // Default to first page

    if (!targetPage?.accessToken || !targetPage?.id) {
      return NextResponse.json({
        success: false,
        error: 'Facebook credentials not configured',
        message: 'Please configure Facebook page access tokens in environment variables'
      }, { status: 500 });
    }

    // Send message via Facebook API
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

      // Store the sent message in database with actual page ID
      const sentMessage = {
        message_id: facebookData.message_id || `sent_${Date.now()}`,
        conversation_id: conversationId || recipientId,
        sender_id: targetPage.id, // Use actual page ID
        sender_name: targetPage.name, // Use our configured page name
        receipt_id: recipientId,
        message_text: message,
        attachments: [],
        timestamp: new Date().toISOString(),
        platform: 'facebook',
        is_replied: true,
        replied_by: 'human',
        reply_message_id: null
      };

      const { error } = await supabase
        .from('facebook_messages')
        .insert([sentMessage]);

      if (error) {
        console.error('Error storing sent message:', error);
        // Don't fail the request if storage fails, message was sent successfully
      }

      return NextResponse.json({
        success: true,
        data: {
          message: 'Message sent successfully',
          messageId: facebookData.message_id,
          facebookResponse: facebookData
        }
      });

    } catch (facebookError) {
      console.error('Error sending Facebook message:', facebookError);
      return NextResponse.json({
        success: false,
        error: 'Failed to send Facebook message',
        message: facebookError instanceof Error ? facebookError.message : 'Unknown Facebook API error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error in Facebook messages POST:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Background sync function that doesn't block the response
async function triggerBackgroundSync() {
  try {
    console.log('Starting background sync for all pages...');
    // Sync all configured pages
    for (const page of FACEBOOK_PAGES) {
      console.log(`Checking page for sync: ${page.name} (${page.id}) - has token: ${!!page.accessToken}`);
      if (page.accessToken && page.id) {
        // Initialize Facebook sync service for this page
        facebookSyncService.initialize(page.accessToken, page.id);

        // Trigger sync without waiting for completion
        facebookSyncService.syncMessages().catch(error => {
          console.error(`Background Facebook sync failed for page ${page.id}:`, error);
          // Don't throw error as this is background operation
        });
        console.log(`Triggered sync for page: ${page.name} (${page.id})`);
      } else {
        console.warn(`Skipping sync for page ${page.name} (${page.id}) - missing token or ID`);
      }
    }

    console.log('Background Facebook sync triggered for all pages');
  } catch (error) {
    console.error('Failed to trigger background sync:', error);
    // Don't throw error as this shouldn't fail the main request
  }
}