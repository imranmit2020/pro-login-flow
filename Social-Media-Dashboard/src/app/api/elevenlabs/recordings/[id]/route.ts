import { NextRequest, NextResponse } from 'next/server';
import { RecordingData, TranscriptResponse, AudioResponse } from '@/types/elevenlabs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type'); // 'transcript' or 'audio'

  if (!id) {
    return NextResponse.json(
      { success: false, error: "Recording ID is required" },
      { status: 400 }
    );
  }

  try {
    if (type === 'transcript') {
      // Fetch transcript
      const transcriptResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/elevenlabs/getTranscript?conversationId=${id}`
      );
      
      if (!transcriptResponse.ok) {
        throw new Error('Failed to fetch transcript');
      }
      
      const transcriptData: TranscriptResponse = await transcriptResponse.json();
      return NextResponse.json(transcriptData);
    } else if (type === 'audio') {
      // Fetch audio
      const audioResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/elevenlabs/getRecordingAudio?conversationId=${id}`
      );
      
      if (!audioResponse.ok) {
        throw new Error('Failed to fetch audio');
      }
      
      const audioData: AudioResponse = await audioResponse.json();
      return NextResponse.json(audioData);
    } else {
      // Return basic recording info
      const recordingData: RecordingData = {
        conversation_id: id,
        agent_name: "Loading...",
        start_time_unix_secs: Date.now() / 1000,
        call_duration_secs: 0,
        status: "loading",
      };
      
      return NextResponse.json({
        success: true,
        data: recordingData,
      });
    }
  } catch (error) {
    console.error("Error fetching recording data:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
