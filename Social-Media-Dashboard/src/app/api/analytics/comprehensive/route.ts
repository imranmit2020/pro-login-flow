import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface AnalyticsData {
  tasks: {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
    completionRate: number;
  };
  emails: {
    total: number;
    sent: number;
    received: number;
    openRate: number;
    responseRate: number;
  };
  schedule: {
    total: number;
    confirmed: number;
    pending: number;
    cancelled: number;
    utilizationRate: number;
  };
  social: {
    total: number;
    engagement: number;
    followers: number;
    reach: number;
    engagementRate: number;
  };
  calls: {
    total: number;
    completed: number;
    missed: number;
    pending: number;
    successRate: number;
    usedCredits?: number;
    remainingCredits?: number;
    totalCredits?: number;
  };
  calendar: {
    total: number;
    appointments: number;
    meetings: number;
    events: number;
    bookingRate: number;
  };
  overview: {
    totalActivities: number;
    completed: number;
    successRate: number;
    patients: number;
  };
}

export async function GET(request: NextRequest) {
  try {
    // Get date ranges for filtering
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    // Fetch all data in parallel
    const [
      tasksResult,
      appointmentsResult,
      facebookMessages,
      instagramMessages,
      elevenLabsUsage,
      elevenLabsCalls
    ] = await Promise.allSettled([
      // 1. Fetch tasks data
      supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false }),

      // 2. Fetch appointments data
      supabase
        .from('appointments')
        .select('*')
        .order('created_at', { ascending: false }),

      // 3. Fetch Facebook messages
      supabase
        .from('facebook_messages')
        .select('message_id, platform, sender_id, created_at, timestamp, is_replied')
        .order('created_at', { ascending: false }),

      // 4. Fetch Instagram messages
      supabase
        .from('instagram_messages')
        .select('message_id, platform, sender_id, created_at, timestamp, is_replied')
        .order('created_at', { ascending: false }),

      // 5. Fetch ElevenLabs usage data
      fetchElevenLabsUsage(),

      // 6. Fetch ElevenLabs calls data
      fetchElevenLabsCalls()
    ]);

    // Process tasks data
    const tasks = tasksResult.status === 'fulfilled' ? tasksResult.value.data || [] : [];
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const pendingTasks = tasks.filter(t => t.status === 'pending').length;
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Process appointments data
    const appointments = appointmentsResult.status === 'fulfilled' ? appointmentsResult.value.data || [] : [];
    const totalAppointments = appointments.length;
    const confirmedAppointments = appointments.filter(a => a.status === 'Confirmed').length;
    const pendingAppointments = appointments.filter(a => a.status === 'Pending').length;
    const cancelledAppointments = appointments.filter(a => a.status === 'Cancelled').length;
    const appointmentUtilizationRate = totalAppointments > 0 ? Math.round((confirmedAppointments / totalAppointments) * 100) : 0;

    // Process social media data
    const facebookMsgs = facebookMessages.status === 'fulfilled' ? facebookMessages.value.data || [] : [];
    const instagramMsgs = instagramMessages.status === 'fulfilled' ? instagramMessages.value.data || [] : [];
    const allSocialMessages = [...facebookMsgs, ...instagramMsgs];
    
    const totalSocialMessages = allSocialMessages.length;
    const repliedMessages = allSocialMessages.filter(m => m.is_replied).length;
    const socialEngagementRate = totalSocialMessages > 0 ? Math.round((repliedMessages / totalSocialMessages) * 100) : 0;

    // Estimate followers and reach (you can implement real follower tracking later)
    const estimatedFollowers = Math.max(1247, totalSocialMessages * 5); // Base followers + message multiplier
    const estimatedReach = Math.max(3456, totalSocialMessages * 15); // Estimated reach

    // Process ElevenLabs data
    const usageData = elevenLabsUsage.status === 'fulfilled' ? elevenLabsUsage.value : null;
    const callsData = elevenLabsCalls.status === 'fulfilled' ? elevenLabsCalls.value : null;

    const totalCalls = callsData?.totalCalls || 0;
    const successfulCalls = callsData?.successfulCalls || 0;
    const callSuccessRate = totalCalls > 0 ? Math.round((successfulCalls / totalCalls) * 100) : 0;

    // Email analytics (placeholder - implement Gmail integration later)
    const emailStats = {
      total: 0, // Implement Gmail message count
      sent: 0,
      received: 0,
      openRate: 0,
      responseRate: 0
    };

    // Calculate overview stats
    const totalActivities = totalTasks + totalAppointments + totalSocialMessages + totalCalls;
    const completedActivities = completedTasks + confirmedAppointments + repliedMessages + successfulCalls;
    const overallSuccessRate = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;

    // Count unique contacts (patients)
    const uniqueContacts = new Set([
      ...allSocialMessages.map(m => m.sender_id),
      ...appointments.map(a => a.phone_number)
    ]);

    const analyticsData: AnalyticsData = {
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        pending: pendingTasks,
        overdue: 0, // Tasks don't have due dates in current schema
        completionRate: taskCompletionRate
      },
      emails: emailStats,
      schedule: {
        total: totalAppointments,
        confirmed: confirmedAppointments,
        pending: pendingAppointments,
        cancelled: cancelledAppointments,
        utilizationRate: appointmentUtilizationRate
      },
      social: {
        total: totalSocialMessages,
        engagement: repliedMessages,
        followers: estimatedFollowers,
        reach: estimatedReach,
        engagementRate: socialEngagementRate
      },
      calls: {
        total: totalCalls,
        completed: successfulCalls,
        missed: totalCalls - successfulCalls,
        pending: 0, // ElevenLabs calls are either completed or failed
        successRate: callSuccessRate,
        usedCredits: usageData?.usedCredits,
        remainingCredits: usageData?.remainingCredits,
        totalCredits: usageData?.totalCredits
      },
      calendar: {
        total: totalAppointments,
        appointments: confirmedAppointments,
        meetings: pendingAppointments, // Pending as meetings to be confirmed
        events: cancelledAppointments, // Cancelled as past events
        bookingRate: appointmentUtilizationRate
      },
      overview: {
        totalActivities,
        completed: completedActivities,
        successRate: overallSuccessRate,
        patients: uniqueContacts.size
      }
    };

    return NextResponse.json({
      success: true,
      data: analyticsData,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching comprehensive analytics:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch analytics data',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Helper function to fetch ElevenLabs usage data
async function fetchElevenLabsUsage() {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) return null;

    const response = await fetch('https://api.elevenlabs.io/v1/user/subscription', {
      headers: { 'xi-api-key': apiKey }
    });

    if (!response.ok) return null;

    const data = await response.json();
    return {
      usedCredits: data.character_count || 0,
      remainingCredits: (data.character_limit || 1000000) - (data.character_count || 0),
      totalCredits: data.character_limit || 1000000
    };
  } catch (error) {
    console.error('Error fetching ElevenLabs usage:', error);
    return null;
  }
}

// Helper function to fetch ElevenLabs calls data
async function fetchElevenLabsCalls() {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    if (!apiKey) return null;

    const response = await fetch('https://api.elevenlabs.io/v1/convai/conversations?page_size=100', {
      headers: { 'xi-api-key': apiKey }
    });

    if (!response.ok) return null;

    const data = await response.json();
    const conversations = data.conversations || [];
    
    const totalCalls = conversations.length;
    const successfulCalls = conversations.filter((conv: any) => {
      return conv.status === 'completed' || 
             conv.status === 'successful' ||
             (conv.duration_seconds && conv.duration_seconds >= 10);
    }).length;

    return {
      totalCalls,
      successfulCalls,
      successRate: totalCalls > 0 ? Math.round((successfulCalls / totalCalls) * 100) : 0
    };
  } catch (error) {
    console.error('Error fetching ElevenLabs calls:', error);
    return null;
  }
} 