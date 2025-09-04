import { google } from 'googleapis';

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.modify'
];

interface TokenSet {
  access_token?: string | null;
  refresh_token?: string | null;
  scope?: string | null;
  token_type?: string | null;
  expiry_date?: number | null;
}

export class GmailAuth {
  private oauth2Client: InstanceType<typeof google.auth.OAuth2>;

  constructor() {
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_BASE_URL}/api/gmail/callback`;
    console.log('gmailAuth: Using redirect URI:', redirectUri);
    
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      redirectUri
    );
  }

  getAuthUrl(): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      prompt: 'consent',
      include_granted_scopes: true
    });
  }

  async getTokens(code: string): Promise<TokenSet> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      
      if (!tokens.refresh_token) {
        console.warn('No refresh token received. User may need to re-authorize with consent.');
      }
      
      this.oauth2Client.setCredentials(tokens);
      return tokens;
    } catch (error) {
      console.error('Error getting access token:', error);
      throw new Error(`Failed to get access token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  setCredentials(tokens: TokenSet): void {
    // Convert null values to undefined to match Credentials type
    const credentials = {
      access_token: tokens.access_token || undefined,
      refresh_token: tokens.refresh_token || undefined,
      scope: tokens.scope || undefined,
      token_type: tokens.token_type || undefined,
      expiry_date: tokens.expiry_date || undefined
    };
    this.oauth2Client.setCredentials(credentials);
  }

  async refreshAccessToken(refreshToken: string): Promise<TokenSet> {
    try {
      if (!refreshToken) {
        throw new Error('No refresh token provided');
      }
      console.log('gmailAuth: Refreshing access token with refresh token:', refreshToken.substring(0, 10) + '...');

      this.oauth2Client.setCredentials({
        refresh_token: refreshToken
      });
      
      const { credentials } = await this.oauth2Client.refreshAccessToken();
      console.log('gmailAuth: Successfully refreshed token. New credentials received.');

      
      if (!credentials.refresh_token && refreshToken) {
        credentials.refresh_token = refreshToken;
      }
      
      this.oauth2Client.setCredentials(credentials);
      return credentials;
    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw new Error(`Failed to refresh access token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  getGmailClient() {
    return google.gmail({ version: 'v1', auth: this.oauth2Client });
  }

  async validateCredentials(): Promise<boolean> {
    try {
      const gmail = this.getGmailClient();
      await gmail.users.getProfile({ userId: 'me' });
      return true;
    } catch (error) {
      console.error('Credential validation failed:', error);
      return false;
    }
  }
} 