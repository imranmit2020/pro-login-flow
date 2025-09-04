import { GmailAuth } from './gmailAuth';

export interface EmailMessage {
  id: string;
  threadId: string;
  sender: {
    name: string;
    email: string;
  };
  subject: string;
  snippet: string;
  body: string;
  timestamp: string;
  status: 'read' | 'unread';
  labels: string[];
  hasAttachments: boolean;
  attachments?: Array<{
    filename: string;
    mimeType: string;
    size: number;
    attachmentId: string;
  }>;
}

export interface EmailReply {
  threadId: string;
  replyText: string;
  recipientEmail: string;
  subject: string;
}

interface GmailMessage {
  id: string;
  threadId: string;
  labelIds?: string[];
  snippet?: string;
  internalDate?: string;
  payload?: {
    headers?: Array<{ name: string; value: string }>;
    parts?: Array<{ [key: string]: unknown }>;
    body?: { data?: string };
  };
}

interface MessageListResponse {
  messages?: Array<{ id: string; threadId: string }>;
}

interface MessageBatchItem {
  id: string;
  threadId: string;
}

interface EmailPart {
  mimeType?: string;
  filename?: string;
  body?: {
    data?: string;
    size?: number;
    attachmentId?: string;
  };
  parts?: EmailPart[];
}

export class GmailApi {
  private gmailAuth: GmailAuth;

  constructor(tokens?: { access_token?: string | null; refresh_token?: string | null }) {
    this.gmailAuth = new GmailAuth();
    if (tokens) {
      // Convert null values to undefined for setCredentials
      const cleanTokens = {
        access_token: tokens.access_token || undefined,
        refresh_token: tokens.refresh_token || undefined
      };
      this.gmailAuth.setCredentials(cleanTokens);
    }
  }

  /**
   * Fetch emails from Gmail
   */
  async fetchEmails(options: {
    maxResults?: number;
    query?: string;
    includeSpamTrash?: boolean;
  } = {}): Promise<EmailMessage[]> {
    try {
      const gmail = this.gmailAuth.getGmailClient();
      const {
        maxResults = 10,
        query = '',
        includeSpamTrash = false
      } = options;

      // Limit max results to prevent memory issues
      const safeMaxResults = Math.min(maxResults, 50);

      // Get list of message IDs
      const listResponse = await gmail.users.messages.list({
        userId: 'me',
        maxResults: safeMaxResults,
        q: query,
        includeSpamTrash
      });

      const messageListData = listResponse.data as MessageListResponse;

      if (!messageListData.messages) {
        return [];
      }

      // Fetch detailed message data with limited concurrency to prevent memory issues
      const messages: EmailMessage[] = [];
      const batchSize = 5; // Process 5 messages at a time
      
      for (let i = 0; i < messageListData.messages.length; i += batchSize) {
        const batch = messageListData.messages.slice(i, i + batchSize);
        
        const batchMessages = await Promise.all(
          batch.map(async (message: MessageBatchItem) => {
            try {
              const messageResponse = await gmail.users.messages.get({
                userId: 'me',
                id: message.id,
                format: 'metadata', // Use metadata format to reduce payload size
                metadataHeaders: ['From', 'To', 'Subject', 'Date']
              });

              return this.parseGmailMessage(messageResponse.data as GmailMessage);
            } catch (error) {
              console.error(`Error fetching message ${message.id}:`, error);
              return null;
            }
          })
        );

        // Add non-null messages to results
        messages.push(...batchMessages.filter(Boolean) as EmailMessage[]);
        
        // Small delay to prevent rate limiting
        if (i + batchSize < messageListData.messages.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      return messages;
    } catch (error) {
      console.error('Error fetching emails:', error);
      throw error;
    }
  }

  /**
   * Send a reply to an email
   */
  async sendReply(replyData: EmailReply): Promise<{ id?: string; threadId?: string; labelIds?: string[] }> {
    try {
      const gmail = this.gmailAuth.getGmailClient();
      
      const emailContent = [
        `To: ${replyData.recipientEmail}`,
        `Subject: Re: ${replyData.subject}`,
        `In-Reply-To: <${replyData.threadId}>`,
        `References: <${replyData.threadId}>`,
        'Content-Type: text/plain; charset=utf-8',
        '',
        replyData.replyText
      ].join('\n');

      const encodedEmail = Buffer.from(emailContent)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const response = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedEmail,
          threadId: replyData.threadId
        }
      });

      return response.data as { id?: string; threadId?: string; labelIds?: string[] };
    } catch (error) {
      console.error('Error sending reply:', error);
      throw error;
    }
  }

  /**
   * Send a new email
   */
  async sendEmail(emailData: {
    to: string;
    subject: string;
    body: string;
    cc?: string;
    bcc?: string;
  }): Promise<{ id?: string; threadId?: string; labelIds?: string[] }> {
    try {
      const gmail = this.gmailAuth.getGmailClient();
      
      const emailContent = [
        `To: ${emailData.to}`,
        emailData.cc ? `Cc: ${emailData.cc}` : '',
        emailData.bcc ? `Bcc: ${emailData.bcc}` : '',
        `Subject: ${emailData.subject}`,
        'Content-Type: text/plain; charset=utf-8',
        '',
        emailData.body
      ].filter(Boolean).join('\n');

      const encodedEmail = Buffer.from(emailContent)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const response = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: encodedEmail
        }
      });

      return response.data as { id?: string; threadId?: string; labelIds?: string[] };
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  }

  /**
   * Mark email as read
   */
  async markAsRead(messageId: string): Promise<void> {
    try {
      const gmail = this.gmailAuth.getGmailClient();
      await gmail.users.messages.modify({
        userId: 'me',
        id: messageId,
        requestBody: {
          removeLabelIds: ['UNREAD']
        }
      });
    } catch (error) {
      console.error('Error marking email as read:', error);
      throw error;
    }
  }

  /**
   * Parse Gmail message format to our EmailMessage interface
   */
  private parseGmailMessage(message: GmailMessage): EmailMessage | null {
    try {
      const headers = message.payload?.headers || [];
      const getHeader = (name: string) => 
        headers.find((h: { name: string; value: string }) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

      const from = getHeader('from');
      const subject = getHeader('subject');
      const date = getHeader('date');

      // Extract sender name and email with better parsing
      let senderName = '';
      let senderEmail = '';
      
      if (from) {
        const fromMatch = from.match(/^(.+?)\s*<(.+)>$/) || from.match(/^(.+)$/);
        if (fromMatch) {
          if (fromMatch[2]) {
            // Format: "Name <email@domain.com>"
            senderName = fromMatch[1]?.trim().replace(/"/g, '') || '';
            senderEmail = fromMatch[2]?.trim() || '';
          } else {
            // Format: "email@domain.com" or just name
            const emailPattern = /\S+@\S+\.\S+/;
            if (emailPattern.test(fromMatch[1])) {
              senderEmail = fromMatch[1].trim();
              senderName = senderEmail.split('@')[0]; // Use email prefix as name
            } else {
              senderName = fromMatch[1].trim();
              senderEmail = fromMatch[1].trim();
            }
          }
        }
      }

      // For metadata format, we don't have body content, so use snippet
      let body = '';
      try {
        if (message.payload?.parts) {
          const textPart = this.findTextPart(message.payload.parts);
          if (textPart && textPart.body?.data) {
            // Limit body size to prevent memory issues
            const bodyData = textPart.body.data;
            if (bodyData.length > 10000) { // Limit to ~7.5KB base64 (10KB decoded)
              console.warn('Email body too large, using snippet instead');
              body = message.snippet || '';
            } else {
              body = Buffer.from(bodyData, 'base64').toString('utf-8');
            }
          }
        } else if (message.payload?.body?.data) {
          const bodyData = message.payload.body.data;
          if (bodyData.length > 10000) {
            console.warn('Email body too large, using snippet instead');
            body = message.snippet || '';
          } else {
            body = Buffer.from(bodyData, 'base64').toString('utf-8');
          }
        }
      } catch (bodyError) {
        console.warn('Error extracting body, using snippet:', bodyError);
        body = message.snippet || '';
      }

      // Fallback to snippet if no body
      if (!body) {
        body = message.snippet || '';
      }

      // Check for attachments (only if payload parts exist)
      const hasAttachments = message.payload?.parts?.some((part: EmailPart) => 
        part.filename && part.body?.attachmentId
      ) || false;

      // Only extract attachments if they exist to save memory
      const attachments = hasAttachments ? this.extractAttachments(message.payload?.parts || []) : [];

      // Parse timestamp more safely
      let timestamp: string;
      try {
        if (date) {
          timestamp = new Date(date).toISOString();
        } else if (message.internalDate) {
          timestamp = new Date(parseInt(message.internalDate)).toISOString();
        } else {
          timestamp = new Date().toISOString();
        }
      } catch (dateError) {
        console.warn('Error parsing date, using current time:', dateError);
        timestamp = new Date().toISOString();
      }

      return {
        id: message.id || '',
        threadId: message.threadId || '',
        sender: {
          name: senderName || 'Unknown',
          email: senderEmail || ''
        },
        subject: subject || '(No Subject)',
        snippet: message.snippet || '',
        body: body.substring(0, 5000), // Limit body to 5KB to prevent memory issues
        timestamp,
        status: message.labelIds?.includes('UNREAD') ? 'unread' : 'read',
        labels: message.labelIds || [],
        hasAttachments,
        attachments
      };
    } catch (error) {
      console.error('Error parsing Gmail message:', error);
      return null;
    }
  }

  /**
   * Find text/plain part in email
   */
  private findTextPart(parts: EmailPart[]): EmailPart | null {
    for (const part of parts) {
      if (part.mimeType === 'text/plain') {
        return part;
      }
      if (part.parts) {
        const textPart = this.findTextPart(part.parts);
        if (textPart) return textPart;
      }
    }
    return null;
  }

  /**
   * Extract attachment information
   */
  private extractAttachments(parts: EmailPart[]): Array<{
    filename: string;
    mimeType: string;
    size: number;
    attachmentId: string;
  }> {
    const attachments: Array<{
      filename: string;
      mimeType: string;
      size: number;
      attachmentId: string;
    }> = [];
    
    for (const part of parts) {
      if (part.filename && part.body?.attachmentId) {
        attachments.push({
          filename: part.filename,
          mimeType: part.mimeType || 'application/octet-stream',
          size: part.body.size || 0,
          attachmentId: part.body.attachmentId
        });
      }
      if (part.parts) {
        attachments.push(...this.extractAttachments(part.parts));
      }
    }
    
    return attachments;
  }

  /**
   * Get user profile
   */
  async getUserProfile(): Promise<{ emailAddress?: string; messagesTotal?: number; threadsTotal?: number; historyId?: string }> {
    try {
      const gmail = this.gmailAuth.getGmailClient();
      const response = await gmail.users.getProfile({ userId: 'me' });
      return response.data as { emailAddress?: string; messagesTotal?: number; threadsTotal?: number; historyId?: string };
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }
} 