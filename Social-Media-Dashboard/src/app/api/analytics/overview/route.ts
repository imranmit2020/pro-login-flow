import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: NextRequest) {
  try {
    // Get today's date for filtering today's messages
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayISO = today.toISOString();

    // Get this week's date for new contacts calculation
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoISO = weekAgo.toISOString();

    // 1. Get total messages from both tables using correct field names
    const { data: facebookMessages, error: fbError } = await supabase
      .from('facebook_messages')
      .select('message_id, platform, sender_id, created_at, timestamp')
      .order('created_at', { ascending: false });

    const { data: instagramMessages, error: igError } = await supabase
      .from('instagram_messages')
      .select('message_id, platform, sender_id, created_at, timestamp')
      .order('created_at', { ascending: false });

    if (fbError) {
      console.error('Error fetching Facebook messages:', fbError);
    }
    if (igError) {
      console.error('Error fetching Instagram messages:', igError);
    }

    // Combine all messages and normalize the structure
    const allMessages = [
      ...(facebookMessages || []).map(msg => ({
        id: msg.message_id,
        platform: msg.platform || 'facebook',
        sender_id: msg.sender_id,
        created_at: msg.created_at,
        timestamp: msg.timestamp
      })),
      ...(instagramMessages || []).map(msg => ({
        id: msg.message_id,
        platform: msg.platform || 'instagram',
        sender_id: msg.sender_id,
        created_at: msg.created_at,
        timestamp: msg.timestamp
      }))
    ];

    // 2. Calculate today's messages by platform
    const todayMessages = allMessages.filter(msg => {
      const messageDate = new Date(msg.created_at || msg.timestamp);
      return messageDate >= today;
    });

    const facebookTodayCount = todayMessages.filter(msg => 
      msg.platform === 'facebook'
    ).length;

    const instagramTodayCount = todayMessages.filter(msg => 
      msg.platform === 'instagram'
    ).length;

    // 3. Calculate total messages by platform (all time)
    const facebookTotalCount = allMessages.filter(msg => 
      msg.platform === 'facebook'
    ).length;

    const instagramTotalCount = allMessages.filter(msg => 
      msg.platform === 'instagram'
    ).length;

    // 4. Calculate new contacts (unique sender_ids in the last week)
    const recentMessages = allMessages.filter(msg => {
      const messageDate = new Date(msg.created_at || msg.timestamp);
      return messageDate >= weekAgo;
    });

    // Filter out page IDs to only count actual customers
    const pageIds = ['381898425500628', '274759011056987']; // Facebook page IDs
    const uniqueRecentSenders = new Set(
      recentMessages
        .filter(msg => !pageIds.includes(msg.sender_id))
        .map(msg => msg.sender_id)
    );
    const newContactsCount = uniqueRecentSenders.size;

    // 5. Check platform connection status
    // Check if we have recent sync activity or credentials
    const { data: syncLogs } = await supabase
      .from('facebook_sync_log')
      .select('sync_type, status, created_at')
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(10);

    const facebookConnected = syncLogs?.some(log => 
      log.sync_type?.includes('facebook') && 
      new Date(log.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000) // within 24 hours
    ) || facebookTotalCount > 0;

    const instagramConnected = syncLogs?.some(log => 
      log.sync_type?.includes('instagram') && 
      new Date(log.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000) // within 24 hours
    ) || instagramTotalCount > 0;

    // Gmail connection status (check if we have Gmail API access)
    const gmailConnected = !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

    // Calculate total messages today
    const totalMessagesToday = facebookTodayCount + instagramTodayCount;
    const totalMessages = facebookTotalCount + instagramTotalCount;

    const analytics = {
      totalMessages,
      totalMessagesToday,
      newContacts: newContactsCount,
      platformStats: {
        facebook: {
          total: facebookTotalCount,
          today: facebookTodayCount,
          connected: facebookConnected
        },
        instagram: {
          total: instagramTotalCount,
          today: instagramTodayCount,
          connected: instagramConnected
        },
        gmail: {
          total: 0, // Gmail not implemented yet
          today: 0,
          connected: gmailConnected
        }
      },
      connectionStatus: {
        facebook: facebookConnected,
        instagram: instagramConnected,
        gmail: gmailConnected,
        connectedCount: [facebookConnected, instagramConnected, gmailConnected].filter(Boolean).length
      }
    };

    return NextResponse.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error('Error fetching analytics overview:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch analytics overview',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 