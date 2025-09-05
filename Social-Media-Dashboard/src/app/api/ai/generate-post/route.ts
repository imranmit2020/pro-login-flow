import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface GeneratePostRequest {
  postType: string;
  businessInfo: string;
  platform: string;
  topic?: string;
  tone?: string;
  includeHashtags?: boolean;
  includeEmojis?: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const { 
      postType, 
      businessInfo, 
      platform, 
      topic, 
      tone = 'professional', 
      includeHashtags = true, 
      includeEmojis = true 
    }: GeneratePostRequest = await request.json();

    if (!businessInfo || !postType || !platform) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Platform-specific guidelines
    const platformGuidelines = {
      facebook: 'Facebook posts should be engaging and conversational, up to 240 characters for best engagement. Include relevant hashtags and emojis.',
      instagram: 'Instagram posts should be visual and trendy, up to 125 characters for captions. Use engaging hashtags and emojis freely.',
      linkedin: 'LinkedIn posts should be professional and industry-focused, 150-300 characters. Use minimal hashtags and professional tone.',
      twitter: 'Twitter posts should be concise and engaging, maximum 280 characters. Use trending hashtags and minimal emojis.',
      general: 'Create engaging social media content that works across platforms.'
    };

    // Post type specific prompts
    const postTypePrompts = {
      engagement: 'Create an engaging post that encourages likes, comments, and shares',
      educational: 'Create an informative and educational post that provides value to followers',
      promotional: 'Create a promotional post that highlights products/services without being too salesy',
      'behind-the-scenes': 'Create a behind-the-scenes post that shows the human side of the business',
      inspirational: 'Create an inspirational and motivational post that resonates with your audience',
      'user-generated': 'Create a post that encourages user-generated content and community interaction',
      announcement: 'Create an announcement post for important business news or updates',
      'how-to': 'Create a helpful how-to or tip-sharing post that educates your audience'
    };

    const prompt = `
You are a professional social media content creator. Create a ${postType} post for the following business:

Business Information: ${businessInfo}
${topic ? `Post Topic/Theme: ${topic}` : ''}
Platform: ${platform}
Tone: ${tone}
Include Hashtags: ${includeHashtags ? 'Yes' : 'No'}
Include Emojis: ${includeEmojis ? 'Yes' : 'No'}

Platform Guidelines: ${platformGuidelines[platform as keyof typeof platformGuidelines] || platformGuidelines.general}

Post Requirements:
- ${postTypePrompts[postType as keyof typeof postTypePrompts] || 'Create engaging social media content'}
- Match the ${tone} tone throughout
- Optimize for ${platform} best practices
- Make it authentic and on-brand
- Include a clear call-to-action if appropriate
${includeHashtags ? '- Include 3-5 relevant hashtags' : ''}
${includeEmojis ? '- Use appropriate emojis to enhance engagement' : ''}

Create ONE compelling social media post:
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an expert social media content creator who specializes in creating engaging, platform-optimized posts that drive organic engagement and build authentic connections with audiences. You understand each platform's unique culture and best practices.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 400,
      temperature: 0.8,
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
      postType,
      platform,
      tone,
      metadata: {
        model: "gpt-4",
        tokens: completion.usage?.total_tokens || 0,
        generated_at: new Date().toISOString(),
        topic: topic || null
      }
    });

  } catch (error) {
    console.error('Error generating post content:', error);
    
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