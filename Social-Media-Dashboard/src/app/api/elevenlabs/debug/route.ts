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
    // Fetch a few recent conversations to analyze the structure
    const response = await fetch(
      "https://api.elevenlabs.io/v1/convai/conversations?page_size=5",
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
    
         // Analyze the structure of each conversation
     const analyzedConversations = data.conversations?.map((conversation: any) => {
       // Deep search for phone-related data
       const findPhoneData = (obj: any, path: string = ''): any => {
         const results: any = {};
         
         if (obj && typeof obj === 'object') {
           Object.keys(obj).forEach(key => {
             const currentPath = path ? `${path}.${key}` : key;
             const value = obj[key];
             
             // Check if this key or value contains phone-related information
             if (typeof key === 'string' && 
                 (key.toLowerCase().includes('phone') || 
                  key.toLowerCase().includes('caller') || 
                  key.toLowerCase().includes('number') ||
                  key.toLowerCase().includes('id'))) {
               results[currentPath] = value;
             }
             
             // Check if the value itself contains phone-related information
             if (typeof value === 'string' && 
                 (value.includes('+') || 
                  /\d{10,}/.test(value) || 
                  value.match(/^\d{3}-\d{3}-\d{4}$/) ||
                  value.match(/^\(\d{3}\) \d{3}-\d{4}$/))) {
               results[currentPath] = value;
             }
             
             // Recursively search nested objects
             if (value && typeof value === 'object' && !Array.isArray(value)) {
               const nestedResults = findPhoneData(value, currentPath);
               Object.assign(results, nestedResults);
             }
           });
         }
         
         return results;
       };
       
       const phoneData = findPhoneData(conversation);
       
       return {
         conversation_id: conversation.conversation_id,
         agent_name: conversation.agent_name,
         status: conversation.status,
         // Check for phone number in various possible locations
         phone_locations: {
           conversation_initiation_client_data: conversation.conversation_initiation_client_data,
           caller_id: conversation.caller_id,
           phone_number: conversation.phone_number,
           user_phone: conversation.user_phone,
           metadata: conversation.metadata,
           // Deep search results
           deep_search_results: phoneData,
           // Check all top-level properties that might contain phone info
           all_properties: Object.keys(conversation).filter(key => 
             key.toLowerCase().includes('phone') || 
             key.toLowerCase().includes('caller') || 
             key.toLowerCase().includes('number')
           ),
           // Show first few properties for analysis
           sample_properties: Object.fromEntries(
             Object.entries(conversation).slice(0, 10)
           )
         }
       };
     }) || [];

    return NextResponse.json({
      success: true,
      data: {
        total_conversations: data.conversations?.length || 0,
        analyzed_conversations: analyzedConversations,
        raw_sample: data.conversations?.[0] || null
      },
    });
  } catch (error) {
    console.error("Error in debug endpoint:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

