import { NextRequest, NextResponse } from 'next/server';
import { RecordingData } from '@/types/elevenlabs';

interface ElevenLabsConversation {
  conversation_id: string;
  agent_id: string;
  agent_name: string;
  start_time_unix_secs: number;
  call_duration_secs: number;
  status: string;
  message_count: number;
  conversation_initiation_client_data?: {
    dynamic_variables?: {
      system__caller_id?: string;
    };
  };
  // Additional possible phone number locations
  caller_id?: string;
  phone_number?: string;
  user_phone?: string;
  metadata?: {
    caller_id?: string;
    phone_number?: string;
    user_phone?: string;
  };
}

interface ElevenLabsResponse {
  conversations: ElevenLabsConversation[];
  has_more: boolean;
  next_cursor?: string;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: "API key not configured" },
      { status: 500 }
    );
  }

  if (!date) {
    return NextResponse.json(
      { success: false, error: "Date parameter is required" },
      { status: 400 }
    );
  }

  try {
    const selectedDate = new Date(date);
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(23, 59, 59, 999);

    const startUnix = Math.floor(startOfDay.getTime() / 1000);
    const endUnix = Math.floor(endOfDay.getTime() / 1000);

    let allRecordings: ElevenLabsConversation[] = [];
    let nextCursor: string | null = null;
    const pageSize = 100;

    do {
      const url = nextCursor
        ? `https://api.elevenlabs.io/v1/convai/conversations?page_size=${pageSize}&cursor=${encodeURIComponent(
            nextCursor
          )}`
        : `https://api.elevenlabs.io/v1/convai/conversations?page_size=${pageSize}`;

      const response = await fetch(url, {
        headers: {
          "xi-api-key": apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(
          `HTTP error from conversations endpoint! status: ${response.status}`
        );
      }

             const data: ElevenLabsResponse = await response.json();
       console.log('Raw ElevenLabs conversations response:', JSON.stringify(data, null, 2));
       const conversations = data.conversations || [];

      const filteredConversations = conversations.filter((conversation) => {
        const conversationTime = conversation.start_time_unix_secs;
        return (
          conversationTime >= startUnix &&
          conversationTime <= endUnix &&
          conversation.status === "done" &&
          conversation.call_duration_secs > 0
        );
      });

      allRecordings = allRecordings.concat(filteredConversations);
      nextCursor = data.has_more ? data.next_cursor || null : null;

      if (filteredConversations.length === 0 && conversations.length > 0) {
        const oldestConversation = conversations[conversations.length - 1];
        if (oldestConversation.start_time_unix_secs < startUnix) {
          break;
        }
      }
    } while (nextCursor);

    allRecordings.sort(
      (a, b) => b.start_time_unix_secs - a.start_time_unix_secs
    );

         // Enhanced phone number extraction with individual conversation fetching
     const recordings: RecordingData[] = await Promise.all(
       allRecordings.map(async (recording) => {
         // Try multiple possible locations for phone number from the list response
         let phoneNumber = 
           recording.conversation_initiation_client_data?.dynamic_variables?.system__caller_id ||
           recording.caller_id ||
           recording.phone_number ||
           recording.user_phone ||
           recording.metadata?.caller_id ||
           recording.metadata?.phone_number ||
           recording.metadata?.user_phone ||
           undefined;
         
         // If no phone number found in list response, try fetching individual conversation details
         if (!phoneNumber && phoneNumber !== '') {
           try {
             const individualResponse = await fetch(
               `https://api.elevenlabs.io/v1/convai/conversations/${recording.conversation_id}`,
               {
                 headers: {
                   "xi-api-key": apiKey,
                 },
               }
             );
             
             if (individualResponse.ok) {
               const individualData = await individualResponse.json();
               console.log(`Individual conversation ${recording.conversation_id} data:`, individualData);
               
                                // Try to extract phone number from individual conversation data
                 phoneNumber = 
                   individualData.conversation_initiation_client_data?.dynamic_variables?.system__caller_id ||
                   individualData.caller_id ||
                   individualData.phone_number ||
                   individualData.user_phone ||
                   individualData.metadata?.caller_id ||
                   individualData.metadata?.phone_number ||
                   individualData.metadata?.user_phone ||
                   undefined;
             }
           } catch (error) {
             console.error(`Error fetching individual conversation ${recording.conversation_id}:`, error);
           }
         }
         
         console.log(`Conversation ${recording.conversation_id}: Final phone number:`, phoneNumber);
         
         return {
           conversation_id: recording.conversation_id,
           agent_id: recording.agent_id,
           agent_name: recording.agent_name,
           start_time_unix_secs: recording.start_time_unix_secs,
           call_duration_secs: recording.call_duration_secs,
           status: recording.status,
           user_phone: phoneNumber,
         };
       })
     );

    return NextResponse.json({
      success: true,
      data: recordings,
    });
  } catch (error) {
    console.error("Error fetching recordings:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
