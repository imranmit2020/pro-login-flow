import { NextResponse } from 'next/server';
import { GmailAuth } from '@/lib/gmailAuth';

export async function GET() {
  try {
    const gmailAuth = new GmailAuth();
    const authUrl = gmailAuth.getAuthUrl();
    
    // Redirect to Google's OAuth consent screen
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Gmail Auth Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to initiate Gmail authentication' },
      { status: 500 }
    );
  }
} 