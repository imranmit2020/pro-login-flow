import { FacebookAPI } from './facebookApi';
import { FacebookMessageService } from './facebookMessageService';

// Facebook page configurations
const FACEBOOK_PAGES = [
  {
    id: process.env.FACEBOOK_PAGE_ID || "381898425500628",
    name: "Smile Experts Dental",
    accessToken: process.env.FACEBOOK_PAGE_ACCESS_TOKEN
  },
  {
    id: process.env.SECOND_FACEBOOK_PAGE_ID || "274759011056987",
    name: "Smile Experts Dental (Dental Office, Washington, DC)",
    accessToken: process.env.SECOND_FACEBOOK_ACCESS_TOKEN
  }
];

export class FacebookSyncService {
  private static instance: FacebookSyncService;
  private syncInterval: NodeJS.Timeout | null = null;
  private isRunning = false;
  private facebookApis: Map<string, FacebookAPI> = new Map();

  private constructor() {}

  static getInstance(): FacebookSyncService {
    if (!FacebookSyncService.instance) {
      FacebookSyncService.instance = new FacebookSyncService();
    }
    return FacebookSyncService.instance;
  }

  // Initialize the service with Facebook API credentials for a specific page
  initialize(pageAccessToken: string, pageId: string) {
    const facebookApi = new FacebookAPI(pageAccessToken, pageId);
    this.facebookApis.set(pageId, facebookApi);
  }

  // Initialize all configured pages
  initializeAllPages() {
    console.log('Initializing all configured pages...');
    FACEBOOK_PAGES.forEach(page => {
      console.log(`Checking page: ${page.name} (${page.id}) - has token: ${!!page.accessToken}`);
      if (page.accessToken && page.id) {
        this.initialize(page.accessToken, page.id);
        console.log(`Initialized page: ${page.name} (${page.id})`);
      } else {
        console.warn(`Skipping page ${page.name} (${page.id}) - missing token or ID`);
      }
    });
    console.log(`Total initialized pages: ${this.facebookApis.size}`);
  }

  // Start continuous sync for all pages
  startSync(intervalMs: number = 30000) { // Default 30 seconds
    if (this.isRunning) {
      console.log('Facebook sync is already running');
      return;
    }

    // Initialize all pages
    this.initializeAllPages();

    if (this.facebookApis.size === 0) {
      console.error('No Facebook APIs initialized. Check your environment variables.');
      return;
    }

    this.isRunning = true;
    console.log(`Starting Facebook message sync for ${this.facebookApis.size} pages with interval:`, intervalMs);

    // Initial sync
    this.syncMessages();

    // Set up interval for continuous sync
    this.syncInterval = setInterval(() => {
      this.syncMessages();
    }, intervalMs);
  }

  // Stop continuous sync
  stopSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    this.isRunning = false;
    console.log('Facebook message sync stopped');
  }

  // Manual sync trigger for all pages
  async syncMessages() {
    if (this.facebookApis.size === 0) {
      console.error('No Facebook APIs initialized');
      return;
    }

    try {
      console.log('Syncing Facebook messages for all pages...');
      
      let totalConversations = 0;
      let totalMessages = 0;

      // Sync each page
      for (const [pageId, facebookApi] of this.facebookApis) {
        try {
          console.log(`Syncing page ${pageId}...`);
      
      // Fetch conversations (this will automatically store messages via the modified FacebookAPI)
          const conversations = await facebookApi.getConversations(200); // Increased to 200
      
      // Also fetch Instagram messages if available
      try {
            const instagramMessages = await facebookApi.getInstagramMessages(200); // Increased to 200
            console.log(`Synced ${instagramMessages.length} Instagram messages for page ${pageId}`);
            totalMessages += instagramMessages.length;
      } catch (instagramError) {
            console.warn(`Instagram sync failed for page ${pageId}:`, instagramError);
      }

          console.log(`Synced ${conversations.length} Facebook conversations for page ${pageId}`);
          totalConversations += conversations.length;
      
      // Get total message count from each conversation
          const pageMessages = conversations.reduce((total, conv) => {
        return total + (conv.messages?.data?.length || 0);
      }, 0);
      
          totalMessages += pageMessages;
          console.log(`Total messages processed for page ${pageId}: ${pageMessages}`);

        } catch (pageError) {
          console.error(`Error syncing page ${pageId}:`, pageError);
        }
      }
      
      console.log(`Total conversations processed: ${totalConversations}`);
      console.log(`Total messages processed: ${totalMessages}`);

    } catch (error) {
      console.error('Error syncing Facebook messages:', error);
    }
  }

  // Sync specific conversation
  async syncConversation(conversationId: string, pageId?: string) {
    if (this.facebookApis.size === 0) {
      console.error('No Facebook APIs initialized');
      return;
    }

    try {
      console.log(`Syncing conversation: ${conversationId}`);
      
      // If pageId is specified, use that specific API
      if (pageId && this.facebookApis.has(pageId)) {
        const facebookApi = this.facebookApis.get(pageId)!;
        const messages = await facebookApi.getConversationMessages(conversationId, 200); // Increased to 200
        console.log(`Synced ${messages.length} messages for conversation ${conversationId} on page ${pageId}`);
        return messages;
      }
      
      // Otherwise, try all APIs
      for (const [pageId, facebookApi] of this.facebookApis) {
        try {
          const messages = await facebookApi.getConversationMessages(conversationId, 200); // Increased to 200
          console.log(`Synced ${messages.length} messages for conversation ${conversationId} on page ${pageId}`);
          return messages;
        } catch (pageError) {
          console.warn(`Failed to sync conversation ${conversationId} on page ${pageId}:`, pageError);
        }
      }
      
      throw new Error(`Could not sync conversation ${conversationId} on any page`);
      
    } catch (error) {
      console.error(`Error syncing conversation ${conversationId}:`, error);
      throw error;
    }
  }

  // Get sync status
  getSyncStatus() {
    return {
      isRunning: this.isRunning,
      hasApis: this.facebookApis.size > 0,
      pageCount: this.facebookApis.size,
      nextSync: this.syncInterval ? 'Running' : 'Stopped'
    };
  }
}

// Export singleton instance
export const facebookSyncService = FacebookSyncService.getInstance();