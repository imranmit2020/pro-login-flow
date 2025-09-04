import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const apiKey = process.env.ELEVENLABS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { success: false, error: "API key not configured" },
      { status: 500 }
    );
  }

  try {
    // Fetch just one conversation to see the structure
    const response = await fetch(
      "https://api.elevenlabs.io/v1/convai/conversations?page_size=1",
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

    const data = await response.json();
    
    // Return the raw data for analysis
    return NextResponse.json({
      success: true,
      data: {
        raw_response: data,
        conversation_count: data.conversations?.length || 0,
        first_conversation: data.conversations?.[0] || null,
        all_keys: data.conversations?.[0] ? Object.keys(data.conversations[0]) : []
      },
    });
  } catch (error) {
    console.error("Error in test endpoint:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
