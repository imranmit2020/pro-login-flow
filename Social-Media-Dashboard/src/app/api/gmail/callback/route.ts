import { NextRequest, NextResponse } from 'next/server';
import { GmailAuth } from '@/lib/gmailAuth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/?error=gmail_auth_denied`
      );
    }

    if (!code) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/?error=no_auth_code`
      );
    }

    const gmailAuth = new GmailAuth();
    const tokens = await gmailAuth.getTokens(code);
    console.log('Gmail callback: Tokens received from Google:', {
      accessToken: !!tokens.access_token,
      refreshToken: !!tokens.refresh_token,
      scope: tokens.scope
    });

    if (!tokens.access_token) {
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_BASE_URL}/?error=no_access_token`
      );
    }

    const response = NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/?gmail_auth=success`
    );

    // Store access token in httpOnly cookies
    response.cookies.set('gmail_access_token', tokens.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 3600 // 1 hour
    });

    // A refresh token is often only provided on the first authorization.
    // If we get a new one, we'll update the cookie.
    if (tokens.refresh_token) {
      console.log('Gmail callback: Refresh token received, setting cookie.');
      response.cookies.set('gmail_refresh_token', tokens.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30 // 30 days
      });
    }

    return response;
  } catch (error) {
    console.error('Gmail Callback Error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/?error=gmail_auth_failed`
    );
  }
} 