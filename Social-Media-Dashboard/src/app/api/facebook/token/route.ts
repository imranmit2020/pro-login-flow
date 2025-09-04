import { NextRequest, NextResponse } from 'next/server';
import { createFacebookAuthService } from '@/lib/facebookAuth';

interface FacebookPage {
  name: string;
  id: string;
  category: string;
  access_token: string;
  tasks: string[];
}

// Enhanced endpoint to get Page Access Tokens using proper OAuth flow
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userAccessToken = searchParams.get('user_token');
    const authCode = searchParams.get('code');
    
    const fbAuth = createFacebookAuthService();

    // Option 1: Use authorization code from OAuth flow (recommended)
    if (authCode) {
      const result = await fbAuth.completeOAuthFlow(authCode);
      
      return NextResponse.json({
        success: true,
        message: 'Page Access Tokens obtained via OAuth flow',
        data: {
          userToken: {
            expires_in: result.userToken.expires_in,
            token_type: result.userToken.token_type
          },
          longLivedUserToken: {
            expires_in: result.longLivedUserToken.expires_in,
            token_type: result.longLivedUserToken.token_type
          },
          pages: result.pages.map((page: FacebookPage) => ({
            name: page.name,
            id: page.id,
            category: page.category,
            access_token: page.access_token,
            tasks: page.tasks
          })),
          selectedPage: result.selectedPage
        }
      });
    }

    // Option 2: Use existing User Access Token (fallback)
    if (userAccessToken) {
      const pages = await fbAuth.getUserPages(userAccessToken);

      return NextResponse.json({
        success: true,
        message: 'Available pages and their access tokens',
        pages: pages.map((page: FacebookPage) => ({
          name: page.name,
          id: page.id,
          category: page.category,
          access_token: page.access_token,
          tasks: page.tasks
        }))
      });
    }

    // Neither code nor token provided
    return NextResponse.json({
      error: 'Missing required parameters',
      message: 'Please provide either "code" (from OAuth) or "user_token"',
      instructions: [
        'Option 1 (Recommended): Use OAuth flow - POST to /api/facebook/callback to get authorization URL',
        'Option 2 (Manual): Get a user access token from: https://developers.facebook.com/tools/explorer/',
        'Then call this endpoint with ?user_token=YOUR_TOKEN or ?code=OAUTH_CODE'
      ]
    }, { status: 400 });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error getting page tokens:', errorMessage);
    return NextResponse.json({
      error: 'Failed to get page tokens',
      details: errorMessage,
      troubleshooting: [
        'Ensure your Facebook app has proper permissions',
        'Verify the user/page admin relationship',
        'Check that tokens are not expired',
        'Confirm app is not in development mode restrictions'
      ]
    }, { status: 500 });
  }
}

// Test endpoint to verify page access token
export async function POST(request: NextRequest) {
  try {
    const { pageAccessToken, pageId } = await request.json();

    if (!pageAccessToken || !pageId) {
      return NextResponse.json({
        error: 'Missing pageAccessToken or pageId'
      }, { status: 400 });
    }

    const fbAuth = createFacebookAuthService();

    // Test the page access token
    const pageInfo = await fbAuth.verifyPageToken(pageAccessToken, pageId);

    return NextResponse.json({
      success: true,
      page: pageInfo,
      message: 'Page Access Token is valid and working',
      capabilities: [
        'Can read page information',
        'Can access page messages (if permissions granted)',
        'Can send messages as page (if permissions granted)'
      ]
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error testing token:', errorMessage);
    return NextResponse.json({
      error: 'Invalid token or insufficient permissions',
      details: errorMessage,
      solutions: [
        'Ensure you have a valid Page Access Token (not User Access Token)',
        'Verify you are an admin of the Facebook Page',
        'Check that your app has the required permissions',
        'Make sure the token is not expired'
      ]
    }, { status: 400 });
  }
} 