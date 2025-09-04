import { NextRequest, NextResponse } from 'next/server';
import { AudioResponse } from '@/types/elevenlabs';

export async function GET(request: NextRequest): Promise<NextResponse<AudioResponse>> {
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
      `https://api.elevenlabs.io/v1/convai/conversations/${conversationId}/audio`,
      {
        headers: {
          "xi-api-key": apiKey,
        },
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({
          success: false,
          error: "Audio not available for this conversation",
        }, { status: 404 });
      }
      throw new Error(
        `HTTP error from audio endpoint! status: ${response.status}`
      );
    }

    const contentType = response.headers.get("content-type") || "audio/mpeg";
    const audioBuffer = await response.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString("base64");

    return NextResponse.json({
      success: true,
      data: {
        audio_base64: audioBase64,
        content_type: contentType,
        conversation_id: conversationId,
      },
    });
  } catch (error) {
    console.error("Error fetching audio:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
