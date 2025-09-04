import { NextRequest, NextResponse } from 'next/server';
import { GmailApi } from '@/lib/gmailApi';
import { GmailAuth } from '@/lib/gmailAuth';

// Send new email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { to, subject, body: emailBody, cc, bcc } = body;

    if (!to || !subject || !emailBody) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: to, subject, body' },
        { status: 400 }
      );
    }

    // Get tokens from cookies
    const accessToken = request.cookies.get('gmail_access_token')?.value;
    const refreshToken = request.cookies.get('gmail_refresh_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'No Gmail access token found. Please authenticate first.' },
        { status: 401 }
      );
    }

    const tokens = {
      access_token: accessToken,
      refresh_token: refreshToken
    };

    try {
      const gmailApi = new GmailApi(tokens);
      const response = await gmailApi.sendEmail({
        to,
        subject,
        body: emailBody,
        cc,
        bcc
      });

      return NextResponse.json({
        success: true,
        data: response,
        message: 'Email sent successfully'
      });
    } catch (authError: unknown) {
      // If token is expired, try to refresh
      const errorMessage = authError instanceof Error ? authError.message : String(authError);
      if (refreshToken && errorMessage.includes('Invalid Credentials')) {
        try {
          const gmailAuth = new GmailAuth();
          const newTokens = await gmailAuth.refreshAccessToken(refreshToken);
          
          const gmailApi = new GmailApi(newTokens);
          const response = await gmailApi.sendEmail({
            to,
            subject,
            body: emailBody,
            cc,
            bcc
          });

          // Update the access token cookie
          const responseWithCookie = NextResponse.json({
            success: true,
            data: response,
            message: 'Email sent successfully'
          });

          responseWithCookie.cookies.set('gmail_access_token', newTokens.access_token || '', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 3600
          });

          return responseWithCookie;
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          return NextResponse.json(
            { success: false, error: 'Authentication expired. Please re-authenticate.' },
            { status: 401 }
          );
        }
      }
      
      throw authError;
    }

  } catch (error) {
    console.error('Gmail Compose Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send email' },
      { status: 500 }
    );
  }
} 