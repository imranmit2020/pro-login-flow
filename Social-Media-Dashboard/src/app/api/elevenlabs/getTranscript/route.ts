import { NextRequest, NextResponse } from 'next/server';
import { ElevenLabsConversationData, ElevenLabsAgentData, TranscriptResponse } from '@/types/elevenlabs';

export async function GET(request: NextRequest): Promise<NextResponse<TranscriptResponse>> {
  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get('conversationId');
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: "API key not configured" },
      { status: 500 }
    );
  }

  if (!conversationId) {
    return NextResponse.json(
      { success: false, error: "Conversation ID is required" },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}`,
      {
        headers: {
          "xi-api-key": apiKey,
        },
      }
    );

    if (!response.ok) {
      throw new Error(
        `HTTP error from conversation endpoint! status: ${response.status}`
      );
    }

    const conversationData: ElevenLabsConversationData = await response.json();
    console.log(
      "Conversation data structure:",
      JSON.stringify(conversationData, null, 2)
    );

    let transcript = "";
    let summary = "";

    if (conversationData.conversation_summary) {
      summary = conversationData.conversation_summary;
    } else if (conversationData.analysis && conversationData.analysis.summary) {
      summary = conversationData.analysis.summary;
    } else if (conversationData.summary) {
      summary = conversationData.summary;
    } else if (
      conversationData.evaluation_result &&
      conversationData.evaluation_result.summary
    ) {
      summary = conversationData.evaluation_result.summary;
    } else if (
      conversationData.evaluation_result &&
      conversationData.evaluation_result.transcript_summary
    ) {
      summary = conversationData.evaluation_result.transcript_summary;
    } else if (
      conversationData.call_analysis &&
      conversationData.call_analysis.summary
    ) {
      summary = conversationData.call_analysis.summary;
    } else if (conversationData.metadata && conversationData.metadata.summary) {
      summary = conversationData.metadata.summary;
    } else {
      summary = "Summary not available";
    }

    if (
      conversationData.transcript &&
      Array.isArray(conversationData.transcript)
    ) {
      transcript = conversationData.transcript
        .filter((entry) => entry.message && entry.message.trim())
        .map((entry) => {
          const role = entry.role || (entry.user_id ? "user" : "agent");
          const message = entry.message || entry.content || "";
          return `${role}: ${message}`;
        })
        .join("\n\n");
    }

    if (
      !transcript &&
      conversationData.messages &&
      Array.isArray(conversationData.messages)
    ) {
      transcript = conversationData.messages
        .filter((msg) => msg.message && msg.message.trim())
        .map((msg) => {
          const role = msg.role || (msg.user_id ? "user" : "agent");
          const message = msg.message || msg.content || "";
          return `${role}: ${message}`;
        })
        .join("\n\n");
    }

    if (
      !transcript &&
      conversationData.conversation_history &&
      Array.isArray(conversationData.conversation_history)
    ) {
      transcript = conversationData.conversation_history
        .filter((item) => item.text && item.text.trim())
        .map((item) => {
          const role = item.from === "agent" ? "agent" : "user";
          return `${role}: ${item.text}`;
        })
        .join("\n\n");
    }

    let agentName = "Unknown Agent";
    if (conversationData.agent_name) {
      agentName = conversationData.agent_name;
    } else if (conversationData.agent_id) {
      try {
        const agentResponse = await fetch(
          `https://api.elevenlabs.io/v1/convai/agents/${conversationData.agent_id}`,
          {
            headers: {
              "xi-api-key": apiKey,
            },
          }
        );
        if (agentResponse.ok) {
          const agentData: ElevenLabsAgentData = await agentResponse.json();
          agentName =
            agentData.name ||
            agentData.agent_name ||
            `Agent ${conversationData.agent_id.slice(-8)}`;
        } else {
          agentName = `Agent ${conversationData.agent_id.slice(-8)}`;
        }
      } catch (error) {
        console.error("Error fetching agent details:", error);
        agentName = `Agent ${conversationData.agent_id.slice(-8)}`;
      }
    }
    
    const duration =
      conversationData.call_duration_secs ||
      conversationData.metadata?.call_duration_secs ||
      0;
    const status = conversationData.status || "completed";

    return NextResponse.json({
      success: true,
      data: {
        transcript:
          transcript || "Transcript not available for this recording.",
        summary: summary || "Summary not available for this recording.",
        raw_conversation_data: conversationData,
        conversation_id: conversationId,
        agent_name: agentName,
        duration: duration,
        status: status,
      },
    });
  } catch (error) {
    console.error("Error fetching transcript:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
