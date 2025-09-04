import { NextRequest, NextResponse } from 'next/server';
import { GmailApi } from '@/lib/gmailApi';
import { GmailAuth } from '@/lib/gmailAuth';

// Gmail API integration for fetching emails
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const query = searchParams.get('q') || '';
    
    // Get tokens from cookies
    const accessToken = request.cookies.get('gmail_access_token')?.value;
    const refreshToken = request.cookies.get('gmail_refresh_token')?.value;
    console.log('Gmail messages route: Got tokens from cookies. AccessToken present:', !!accessToken, 'RefreshToken present:', !!refreshToken);

    if (!accessToken) {
      console.log('Gmail messages route: No access token found in cookies.');
      return NextResponse.json(
        { success: false, error: 'No Gmail access token found. Please authenticate first.' },
        { status: 401 }
      );
    }

    // Set up Gmail API with tokens
    const tokens = {
      access_token: accessToken,
      refresh_token: refreshToken
    };

    try {
      const gmailApi = new GmailApi(tokens);
      const emails = await gmailApi.fetchEmails({
        maxResults: limit,
        query: query
      });

      return NextResponse.json({
        success: true,
        data: emails,
        total: emails.length
      });
    } catch (authError: unknown) {
      const error = authError as { code?: number; message?: string };
      console.error('Gmail API authentication error:', error);
      
      // Check for various authentication error types
      const isAuthError = error.code === 401 || 
                         error.message?.includes('Invalid Credentials') ||
                         error.message?.includes('invalid_grant') ||
                         error.message?.includes('Token has been expired');

      console.log('Gmail messages route: Caught auth error. Is auth error:', isAuthError, 'Refresh token available:', !!refreshToken);
      // If token is expired or invalid, try to refresh
      if (refreshToken && isAuthError) {
        try {
          console.log('Gmail messages route: Attempting to refresh access token...');
          const gmailAuth = new GmailAuth();
          const newTokens = await gmailAuth.refreshAccessToken(refreshToken);
          
          if (!newTokens.access_token) {
            throw new Error('No access token received from refresh');
          }
          
          const gmailApi = new GmailApi(newTokens);
          const emails = await gmailApi.fetchEmails({
            maxResults: limit,
            query: query
          });

          // Update the access token cookie
          const response = NextResponse.json({
            success: true,
            data: emails,
            total: emails.length,
            refreshed: true
          });

          response.cookies.set('gmail_access_token', newTokens.access_token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 3600
          });

          // Update refresh token if a new one was provided
          if (newTokens.refresh_token) {
            response.cookies.set('gmail_refresh_token', newTokens.refresh_token, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: 60 * 60 * 24 * 30
            });
          }

          return response;
        } catch (refreshError: unknown) {
          const refError = refreshError as Error;
          console.error('Token refresh failed:', refError);
          
          // Clear invalid tokens
          const response = NextResponse.json(
            { success: false, error: 'Authentication expired. Please re-authenticate.', requiresReauth: true },
            { status: 401 }
          );
          
          response.cookies.delete('gmail_access_token');
          response.cookies.delete('gmail_refresh_token');
          
          return response;
        }
      }
      
      throw authError;
    }

  } catch (error) {
    console.error('Gmail API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch Gmail messages' },
      { status: 500 }
    );
  }
}

// Send email reply
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { threadId, replyText, recipientEmail, subject } = body;

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
      const response = await gmailApi.sendReply({
        threadId,
        replyText,
        recipientEmail,
        subject
      });

      return NextResponse.json({
        success: true,
        data: response,
        message: 'Email reply sent successfully'
      });
    } catch (authError: unknown) {
      const error = authError as Error;
      // If token is expired, try to refresh
      if (refreshToken && error.message?.includes('Invalid Credentials')) {
        try {
          const gmailAuth = new GmailAuth();
          const newTokens = await gmailAuth.refreshAccessToken(refreshToken);
          
          const gmailApi = new GmailApi(newTokens);
          const response = await gmailApi.sendReply({
            threadId,
            replyText,
            recipientEmail,
            subject
          });

          // Update the access token cookie
          const responseWithCookie = NextResponse.json({
            success: true,
            data: response,
            message: 'Email reply sent successfully'
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
    console.error('Gmail Reply Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send email reply' },
      { status: 500 }
    );
  }
} 