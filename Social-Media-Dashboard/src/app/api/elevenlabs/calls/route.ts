import { NextRequest, NextResponse } from 'next/server';

// Define the type for ElevenLabs conversation objects
interface ElevenLabsConversation {
  status?: string;
  duration_seconds?: number;
  conversation_summary?: string;
  end_reason?: string;
  transcript?: string;
  [key: string]: any; // Allow additional properties from the API
}

// Define the API response structure
interface ElevenLabsApiResponse {
  conversations: ElevenLabsConversation[];
  has_more: boolean;
  next_cursor?: string;
}

export async function GET(request: NextRequest) {
  try {
    let allConversations: ElevenLabsConversation[] = [];
    let nextCursor: string | null = null;
    const pageSize = 100; // Max page size for efficiency
    const apiKey = process.env.ELEVENLABS_API_KEY;

    if (!apiKey) {
      throw new Error('ELEVENLABS_API_KEY is not set');
    }

    // Fetch all conversations, handling pagination
    do {
      const url: string = nextCursor
        ? `https://api.elevenlabs.io/v1/convai/conversations?page_size=${pageSize}&cursor=${encodeURIComponent(nextCursor)}`
        : `https://api.elevenlabs.io/v1/convai/conversations?page_size=${pageSize}`;
      
      const response: Response = await fetch(url, {
        method: 'GET',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API responded with status ${response.status}`);
      }

      const data: ElevenLabsApiResponse = await response.json();
      allConversations = allConversations.concat(data.conversations);
      nextCursor = data.has_more ? data.next_cursor || null : null;
    } while (nextCursor);

    // Calculate total calls
    const totalCalls = allConversations.length;

    // Calculate successful calls based on different criteria
    const successfulCalls = allConversations.filter(conversation => {
      // Check multiple indicators of success:
      
      // 1. Check if conversation was completed successfully
      if (conversation.status === 'completed' || conversation.status === 'successful') {
        return true;
      }

      // 2. Check if conversation has a reasonable duration (adjust threshold as needed)
      // A very short call might indicate failure/hangup
      const minDurationSeconds = 10; // Minimum 10 seconds for successful call
      if (conversation.duration_seconds && conversation.duration_seconds >= minDurationSeconds) {
        return true;
      }

      // 3. Check if conversation reached conclusion/goal
      // This depends on your conversation flow - adjust based on your use case
      if (conversation.conversation_summary && 
          (conversation.conversation_summary.includes('booking') || 
           conversation.conversation_summary.includes('appointment') ||
           conversation.conversation_summary.includes('scheduled') ||
           conversation.conversation_summary.includes('confirmed'))) {
        return true;
      }

      // 4. Check if conversation wasn't terminated early
      if (conversation.end_reason !== 'user_hangup' && 
          conversation.end_reason !== 'error' && 
          conversation.end_reason !== 'timeout') {
        return true;
      }

      // 5. Check if conversation has transcript indicating engagement
      if (conversation.transcript && conversation.transcript.length > 100) {
        return true;
      }

      return false;
    }).length;

    // Calculate unsuccessful calls
    const unsuccessfulCalls = totalCalls - successfulCalls;

    // Calculate success rate for reference
    const successRateValue = totalCalls > 0 ? (successfulCalls / totalCalls) * 100 : 0;

    // Additional metrics that might be useful
    const callsByStatus: Record<string, number> = {};
    const callsByEndReason: Record<string, number> = {};
    let totalDuration = 0;
    let averageDuration = 0;

    allConversations.forEach(conversation => {
      // Group by status
      const status = conversation.status || 'unknown';
      callsByStatus[status] = (callsByStatus[status] || 0) + 1;

      // Group by end reason
      const endReason = conversation.end_reason || 'unknown';
      callsByEndReason[endReason] = (callsByEndReason[endReason] || 0) + 1;

      // Calculate total duration
      if (conversation.duration_seconds) {
        totalDuration += conversation.duration_seconds;
      }
    });

    // Calculate average duration
    if (totalCalls > 0) {
      averageDuration = totalDuration / totalCalls;
    }

    // Return comprehensive call data including conversations for logs
    return NextResponse.json({
      totalCalls,
      successfulCalls,
      unsuccessfulCalls,
      successRate: Number(successRateValue.toFixed(1)),
      averageDurationSeconds: Number(averageDuration.toFixed(1)),
      averageDurationMinutes: Number((averageDuration / 60).toFixed(1)),
      callsByStatus,
      callsByEndReason,
      totalDurationSeconds: totalDuration,
      conversations: allConversations,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching ElevenLabs conversations:', error);
    
    // Return more detailed error information for debugging
    return NextResponse.json({ 
      error: 'Failed to fetch call data',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
} 