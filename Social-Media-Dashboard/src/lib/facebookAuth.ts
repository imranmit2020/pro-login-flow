import axios from 'axios';

const FACEBOOK_GRAPH_API_URL = 'https://graph.facebook.com/v20.0';

export interface FacebookUserAccessToken {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface FacebookPageInfo {
  id: string;
  name: string;
  access_token: string;
  category: string;
  tasks: string[];
  perms?: string[];
}

export interface FacebookLongLivedToken {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export class FacebookAuthService {
  private appId: string;
  private appSecret: string;
  private redirectUri: string;

  constructor(appId: string, appSecret: string, redirectUri: string) {
    this.appId = appId;
    this.appSecret = appSecret;
    this.redirectUri = redirectUri;
  }

  /**
   * Generate OAuth URL for user authorization
   * Step 1: Direct user to Facebook OAuth dialog
   */
  generateOAuthUrl(scopes: string[] = [
    'pages_show_list', 
    'pages_manage_posts', 
    'pages_read_engagement',
    'pages_messaging',
    'instagram_basic',
    'instagram_manage_messages',
    'business_management',
    'read_insights',
    'instagram_manage_insights'
  ]): string {
    const params = new URLSearchParams({
      client_id: this.appId,
      redirect_uri: this.redirectUri,
      scope: scopes.join(','),
      response_type: 'code',
      state: this.generateState() // CSRF protection
    });

    return `https://www.facebook.com/v20.0/dialog/oauth?${params.toString()}`;
  }

  /**
   * Exchange authorization code for User Access Token
   * Step 2: Get User Access Token from OAuth code
   */
  async exchangeCodeForUserToken(code: string): Promise<FacebookUserAccessToken> {
    try {
      const params = new URLSearchParams({
        client_id: this.appId,
        redirect_uri: this.redirectUri,
        client_secret: this.appSecret,
        code: code
      });

      const response = await axios.get(
        `${FACEBOOK_GRAPH_API_URL}/oauth/access_token?${params.toString()}`
      );

      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { message?: string } } }; message?: string };
      console.error('Error exchanging code for user token:', err.response?.data || err.message);
      throw new Error(`Failed to exchange code for user token: ${err.response?.data?.error?.message || err.message}`);
    }
  }

  /**
   * Get long-lived User Access Token (60 days)
   * Step 3: Extend short-lived token to long-lived
   */
  async getLongLivedUserToken(shortLivedToken: string): Promise<FacebookLongLivedToken> {
    try {
      const params = new URLSearchParams({
        grant_type: 'fb_exchange_token',
        client_id: this.appId,
        client_secret: this.appSecret,
        fb_exchange_token: shortLivedToken
      });

      const response = await axios.get(
        `${FACEBOOK_GRAPH_API_URL}/oauth/access_token?${params.toString()}`
      );

      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { message?: string } } }; message?: string };
      console.error('Error getting long-lived token:', err.response?.data || err.message);
      throw new Error(`Failed to get long-lived token: ${err.response?.data?.error?.message || err.message}`);
    }
  }

  /**
   * Get user's Facebook Pages and their Page Access Tokens
   * Step 4: Use User Access Token to get Page Access Tokens
   */
  async getUserPages(userAccessToken: string): Promise<FacebookPageInfo[]> {
    try {
      const response = await axios.get(
        `${FACEBOOK_GRAPH_API_URL}/me/accounts`,
        {
          params: {
            access_token: userAccessToken,
            fields: 'name,id,access_token,category,tasks,perms'
          }
        }
      );

      return response.data.data || [];
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { message?: string } } }; message?: string };
      console.error('Error fetching user pages:', err.response?.data || err.message);
      throw new Error(`Failed to fetch user pages: ${err.response?.data?.error?.message || err.message}`);
    }
  }

  /**
   * Verify Page Access Token
   * Step 5: Validate the Page Access Token
   */
  async verifyPageToken(pageAccessToken: string, pageId: string): Promise<{ id: string; name: string; category: string; access_token: string }> {
    try {
      const response = await axios.get(
        `${FACEBOOK_GRAPH_API_URL}/${pageId}`,
        {
          params: {
            access_token: pageAccessToken,
            fields: 'name,id,category,access_token'
          }
        }
      );

      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { message?: string } } }; message?: string };
      console.error('Error verifying page token:', err.response?.data || err.message);
      throw new Error(`Failed to verify page token: ${err.response?.data?.error?.message || err.message}`);
    }
  }

  /**
   * Get token information and permissions
   */
  async getTokenInfo(accessToken: string): Promise<{ id: string; name: string; permissions?: { data: Array<{ permission: string; status: string }> } }> {
    try {
      const response = await axios.get(
        `${FACEBOOK_GRAPH_API_URL}/me`,
        {
          params: {
            access_token: accessToken,
            fields: 'id,name,permissions'
          }
        }
      );

      return response.data;
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: { message?: string } } }; message?: string };
      console.error('Error getting token info:', err.response?.data || err.message);
      throw new Error(`Failed to get token info: ${err.response?.data?.error?.message || err.message}`);
    }
  }

  /**
   * Complete OAuth flow - from authorization code to Page Access Token
   */
  async completeOAuthFlow(authCode: string, pageName?: string): Promise<{
    userToken: FacebookUserAccessToken;
    longLivedUserToken: FacebookLongLivedToken;
    pages: FacebookPageInfo[];
    selectedPage?: FacebookPageInfo;
  }> {
    try {
      // Step 1: Exchange code for user token
      const userToken = await this.exchangeCodeForUserToken(authCode);
      
      // Step 2: Get long-lived user token
      const longLivedUserToken = await this.getLongLivedUserToken(userToken.access_token);
      
      // Step 3: Get pages with Page Access Tokens
      const pages = await this.getUserPages(longLivedUserToken.access_token);
      
      // Step 4: Find specific page if name provided
      let selectedPage: FacebookPageInfo | undefined;
      if (pageName) {
        selectedPage = pages.find(page => 
          page.name.toLowerCase().includes(pageName.toLowerCase())
        );
      }

      return {
        userToken,
        longLivedUserToken,
        pages,
        selectedPage
      };
    } catch (error: unknown) {
      console.error('Error completing OAuth flow:', error);
      throw error;
    }
  }

  /**
   * Generate a random state for CSRF protection
   */
  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * Validate state parameter for CSRF protection
   */
  validateState(state: string, expectedState: string): boolean {
    return state === expectedState;
  }
}

// Export a configured instance
export const createFacebookAuthService = () => {
  const appId = process.env.FACEBOOK_APP_ID;
  const appSecret = process.env.FACEBOOK_APP_SECRET;
  const redirectUri = process.env.FACEBOOK_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL}/api/facebook/callback`;

  if (!appId || !appSecret) {
    throw new Error('Facebook App ID and App Secret must be configured in environment variables');
  }

  return new FacebookAuthService(appId, appSecret, redirectUri);
}; 