import { NextRequest, NextResponse } from 'next/server';
import { ActiveCallsData, RecordingData } from '@/types/elevenlabs';

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
}

interface ElevenLabsResponse {
  conversations: ElevenLabsConversation[];
}

export async function GET(request: NextRequest): Promise<NextResponse<ActiveCallsData>> {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: "API key not configured" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      "https://api.elevenlabs.io/v1/convai/conversations",
      {
        headers: {
          "xi-api-key": apiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `HTTP error from conversations endpoint! status: ${response.status}`
      );
    }

    const data: ElevenLabsResponse = await response.json();
    console.log("Conversations response:", data);

    const conversations = data.conversations || [];

    const activeCalls = conversations.filter((conversation) => {
      return (
        conversation.status === "initiated" ||
        conversation.status === "active" ||
        conversation.status === "ongoing" ||
        (conversation.call_duration_secs === 0 &&
          conversation.status !== "completed")
      );
    });

    const activeCallsCount = activeCalls.length;

    const callsInProgress: RecordingData[] = activeCalls.map((call) => ({
      conversation_id: call.conversation_id,
      agent_id: call.agent_id,
      agent_name: call.agent_name,
      start_time_unix_secs: call.start_time_unix_secs,
      call_duration_secs: call.call_duration_secs,
      status: call.status,
      user_phone: call.conversation_initiation_client_data?.dynamic_variables?.system__caller_id || undefined,
    }));

    return NextResponse.json({
      success: true,
      data: {
        active_calls: activeCallsCount,
        calls_in_progress: callsInProgress,
      },
    });
  } catch (error) {
    console.error("Error fetching active calls:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
