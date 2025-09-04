import { InstagramAPI } from './instagramApi';
import { InstagramMessageService } from './instagramMessageService';

export class InstagramSyncService {
  private static instance: InstagramSyncService;
  private syncInterval: NodeJS.Timeout | null = null;
  private isRunning = false;
  private instagramApi: InstagramAPI | null = null;

  private constructor() {}

  static getInstance(): InstagramSyncService {
    if (!InstagramSyncService.instance) {
      InstagramSyncService.instance = new InstagramSyncService();
    }
    return InstagramSyncService.instance;
  }

  // Initialize the service with Instagram API credentials
  initialize(accessToken: string, instagramBusinessAccountId: string, useInstagramApi: boolean = false, pageId?: string) {
    this.instagramApi = new InstagramAPI(accessToken, instagramBusinessAccountId, useInstagramApi, pageId);
  }

  // Start continuous sync
  startSync(intervalMs: number = 30000) { // Default 30 seconds
    if (this.isRunning) {
      console.log('Instagram sync is already running');
      return;
    }

    if (!this.instagramApi) {
      console.error('Instagram API not initialized. Call initialize() first.');
      return;
    }

    this.isRunning = true;
    console.log('Starting Instagram message sync with interval:', intervalMs);

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
    console.log('Instagram message sync stopped');
  }

  // Manual sync trigger
  async syncMessages() {
    if (!this.instagramApi) {
      console.error('Instagram API not initialized');
      return;
    }

    const syncStartTime = Date.now();
    let messagesProcessed = 0;
    let conversationsProcessed = 0;

    try {
      console.log('🔄 Syncing Instagram messages...');
      
      // Log sync start
      await this.logSyncStart('messages');
      
      // Fetch conversations
      const conversations = await this.instagramApi.getConversations(50);
      conversationsProcessed = conversations.length;
      
      console.log(`📊 Found ${conversations.length} Instagram conversations`);

      // Fetch and store messages for each conversation
      for (const conversation of conversations) {
        try {
          console.log(`📥 Fetching messages for conversation ${conversation.id}...`);
          
          // Get messages for this conversation
          const messages = await this.instagramApi.getMessages(conversation.id, 25);
          
          if (messages.length > 0) {
            // Store messages using InstagramMessageService
            await InstagramMessageService.storeMessages(messages, conversation.id);
            messagesProcessed += messages.length;
            console.log(`✅ Stored ${messages.length} messages for conversation ${conversation.id}`);
          }
        } catch (convError) {
          console.warn(`⚠️ Failed to sync conversation ${conversation.id}:`, convError);
        }
      }

      const syncDuration = Date.now() - syncStartTime;
      
      console.log(`🎯 Instagram sync completed - Messages: ${messagesProcessed}, Conversations: ${conversationsProcessed}, Duration: ${syncDuration}ms`);
      
      // Log successful sync
      await this.logSyncComplete('messages', messagesProcessed, conversationsProcessed, syncDuration);

    } catch (error) {
      const syncDuration = Date.now() - syncStartTime;
      console.error('❌ Error syncing Instagram messages:', error);
      
      // Log failed sync
      await this.logSyncError('messages', error instanceof Error ? error.message : 'Unknown error', syncDuration);
    }
  }

  // Sync specific conversation
  async syncConversation(conversationId: string) {
    if (!this.instagramApi) {
      console.error('Instagram API not initialized');
      return;
    }

    try {
      console.log(`🔄 Syncing Instagram conversation: ${conversationId}`);
      
      // Fetch messages for specific conversation
      const messages = await this.instagramApi.getMessages(conversationId, 100);
      
      if (messages.length > 0) {
        // Store messages using InstagramMessageService
        await InstagramMessageService.storeMessages(messages, conversationId);
        console.log(`✅ Synced ${messages.length} messages for Instagram conversation ${conversationId}`);
      }
      
      return messages;
    } catch (error) {
      console.error(`❌ Error syncing Instagram conversation ${conversationId}:`, error);
      throw error;
    }
  }

  // Sync Instagram media posts and comments
  async syncMedia() {
    if (!this.instagramApi) {
      console.error('Instagram API not initialized');
      return;
    }

    const syncStartTime = Date.now();
    let mediaProcessed = 0;
    let commentsProcessed = 0;

    try {
      console.log('🔄 Syncing Instagram media and comments...');
      
      // Log sync start
      await this.logSyncStart('media');
      
      // Fetch recent media posts
      const mediaPosts = await this.instagramApi.getMedia(25);
      mediaProcessed = mediaPosts.length;
      
      console.log(`📊 Found ${mediaPosts.length} Instagram media posts`);

      // For each media post, fetch and process comments
      for (const media of mediaPosts) {
        try {
          console.log(`💬 Fetching comments for media ${media.id}...`);
          
          const comments = await this.instagramApi.getMediaComments(media.id, 10);
          commentsProcessed += comments.length;
          
          if (comments.length > 0) {
            console.log(`✅ Found ${comments.length} comments for media ${media.id}`);
            
            // Here you could store comments in a separate table if needed
            // For now, we'll just log them
            for (const comment of comments) {
              console.log(`📝 Comment from ${comment.from.username}: ${comment.text}`);
            }
          }
        } catch (mediaError) {
          console.warn(`⚠️ Failed to sync comments for media ${media.id}:`, mediaError);
        }
      }

      const syncDuration = Date.now() - syncStartTime;
      
      console.log(`🎯 Instagram media sync completed - Media: ${mediaProcessed}, Comments: ${commentsProcessed}, Duration: ${syncDuration}ms`);
      
      // Log successful sync
      await this.logSyncComplete('media', commentsProcessed, mediaProcessed, syncDuration);

    } catch (error) {
      const syncDuration = Date.now() - syncStartTime;
      console.error('❌ Error syncing Instagram media:', error);
      
      // Log failed sync
      await this.logSyncError('media', error instanceof Error ? error.message : 'Unknown error', syncDuration);
    }
  }

  // Full sync (messages + media)
  async syncAll() {
    console.log('🚀 Starting full Instagram sync (messages + media)...');
    
    try {
      await this.syncMessages();
      await this.syncMedia();
      console.log('✅ Full Instagram sync completed');
    } catch (error) {
      console.error('❌ Full Instagram sync failed:', error);
      throw error;
    }
  }

  // Get sync status
  getSyncStatus() {
    return {
      isRunning: this.isRunning,
      hasApi: !!this.instagramApi,
      nextSync: this.syncInterval ? 'Running' : 'Stopped'
    };
  }

  // Simplified logging - just console logs since we removed the sync log table
  private async logSyncStart(syncType: string) {
    console.log(`📝 Starting Instagram sync: ${syncType}`);
  }

  private async logSyncComplete(syncType: string, messagesProcessed: number, conversationsProcessed: number, syncDurationMs: number) {
    console.log(`✅ Instagram sync completed: ${syncType} - Messages: ${messagesProcessed}, Conversations: ${conversationsProcessed}, Duration: ${syncDurationMs}ms`);
  }

  private async logSyncError(syncType: string, errorMessage: string, syncDurationMs: number) {
    console.error(`❌ Instagram sync failed: ${syncType} - Error: ${errorMessage}, Duration: ${syncDurationMs}ms`);
  }
}

// Export singleton instance
export const instagramSyncService = InstagramSyncService.getInstance(); 