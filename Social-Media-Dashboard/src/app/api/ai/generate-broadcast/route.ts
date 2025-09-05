import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface GenerateBroadcastRequest {
  campaignType: string;
  businessInfo: string;
  channels: string[];
}

export async function POST(request: NextRequest) {
  try {
    const { campaignType, businessInfo, channels }: GenerateBroadcastRequest = await request.json();

    if (!businessInfo || !campaignType || !channels.length) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create channel-specific prompt
    const channelContext = channels.map(channel => {
      switch (channel) {
        case 'sms':
          return 'SMS (160 characters max, direct and urgent)';
        case 'email':
          return 'Email (professional with subject line)';
        case 'facebook':
          return 'Facebook (engaging with hashtags)';
        case 'instagram':
          return 'Instagram (visual storytelling with emojis)';
        case 'linkedin':
          return 'LinkedIn (professional and industry-focused)';
        default:
          return channel;
      }
    }).join(', ');

    // Create campaign-specific prompt
    const campaignPrompts = {
      sales: 'Create a compelling sales message that drives immediate action and conversions',
      engagement: 'Create an engaging message that encourages interaction and builds community',
      announcement: 'Create a professional announcement that clearly communicates important news',
      promotion: 'Create an exciting promotional message that highlights special offers and value'
    };

    const prompt = `
You are an expert marketing copywriter. Create a ${campaignType} broadcast message for the following business:

Business Information: ${businessInfo}

Campaign Type: ${campaignType}
Target Channels: ${channelContext}

Requirements:
- ${campaignPrompts[campaignType as keyof typeof campaignPrompts] || 'Create an effective marketing message'}
- Optimize for multi-channel broadcasting across: ${channels.join(', ')}
- Include a strong call-to-action
- Be conversational and engaging
- Focus on boosting sales and customer engagement
- Keep it concise but impactful
- Include relevant emojis where appropriate
- If including hashtags, make them relevant and not excessive

Generate ONE versatile message that works well across all selected channels:
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert marketing copywriter specializing in multi-channel campaigns that drive sales and engagement. Create compelling, action-oriented content that converts across SMS, email, and social media platforms."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const generatedContent = completion.choices[0].message.content;

    if (!generatedContent) {
      return NextResponse.json(
        { success: false, error: 'Failed to generate content' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      content: generatedContent.trim(),
      campaignType,
      channels,
      metadata: {
        model: "gpt-4",
        tokens: completion.usage?.total_tokens || 0,
        generated_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error generating broadcast content:', error);
    
    if (error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json(
        { success: false, error: 'OpenAI API key not configured' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}