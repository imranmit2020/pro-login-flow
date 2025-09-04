import { useState, useEffect, useCallback } from 'react';

export interface GmailEmail {
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
}

export function useGmail() {
  const [emails, setEmails] = useState<GmailEmail[]>([]);
  const [loading, setLoading] = useState(false);
  const [backgroundLoading, setBackgroundLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuthStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/gmail/messages?limit=1');
      const isAuth = response.ok;
      setIsAuthenticated(isAuth);
      
      // Clear emails if not authenticated
      if (!isAuth) {
        setEmails([]);
      }
      
      return isAuth;
    } catch {
      setIsAuthenticated(false);
      setEmails([]);
      return false;
    }
  }, []);

  const authenticateGmail = async () => {
    try {
      // Directly navigate to the auth endpoint, which will redirect to Google
      window.location.href = '/api/gmail/auth';
    } catch (error) {
      setError('Failed to initiate Gmail authentication');
      console.error('Gmail auth error:', error);
    }
  };

  const fetchEmails = useCallback(async (options: {
    limit?: number;
    query?: string;
    background?: boolean; // New parameter for background refresh
  } = {}) => {
    // Use background loading state for auto-refresh, regular loading for user actions
    if (options.background) {
      setBackgroundLoading(true);
    } else {
      setLoading(true);
    }
    setError(null);
    
    try {
      const params = new URLSearchParams();
      if (options.limit) params.append('limit', options.limit.toString());
      if (options.query) params.append('q', options.query);
      
      const response = await fetch(`/api/gmail/messages?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setEmails(data.data);
        // Only update authentication status if it's not already true
        if (!isAuthenticated) {
          setIsAuthenticated(true);
        }
      } else {
        if (response.status === 401) {
          setIsAuthenticated(false);
          setEmails([]); // Clear emails when not authenticated
          setError('Gmail authentication required');
        } else {
          throw new Error(data.error || 'Failed to fetch emails');
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch emails';
      setError(errorMessage);
      console.error('Error fetching emails:', error);
      // Don't change auth status on network errors, only on 401s
    } finally {
      if (options.background) {
        setBackgroundLoading(false);
      } else {
        setLoading(false);
      }
    }
  }, [isAuthenticated]);

  const sendReply = useCallback(async (replyData: {
    threadId: string;
    replyText: string;
    recipientEmail: string;
    subject: string;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/gmail/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(replyData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        await fetchEmails();
        return data.data;
      } else {
        if (response.status === 401) {
          setIsAuthenticated(false);
          setError('Gmail authentication required');
        } else {
          throw new Error(data.error || 'Failed to send reply');
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send reply';
      setError(errorMessage);
      console.error('Error sending reply:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchEmails]);

  const sendEmail = useCallback(async (emailData: {
    to: string;
    subject: string;
    body: string;
    cc?: string;
    bcc?: string;
  }) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/gmail/compose', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Refresh emails to show the sent email
        await fetchEmails();
        return data.data;
      } else {
        if (response.status === 401) {
          setIsAuthenticated(false);
          setError('Gmail authentication required');
        } else {
          throw new Error(data.error || 'Failed to send email');
        }
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send email';
      setError(errorMessage);
      console.error('Error sending email:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [fetchEmails]);

  const logoutGmail = async () => {
    try {
      const response = await fetch('/api/gmail/logout');
      const data = await response.json();
      
      if (data.success) {
        setIsAuthenticated(false);
        setEmails([]);
        setError(null);
        return true;
      } else {
        throw new Error(data.error || 'Failed to logout');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to logout';
      setError(errorMessage);
      console.error('Error logging out:', error);
      return false;
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Auto-refresh emails every 30 seconds when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      fetchEmails({ limit: 20, background: true }); // Background refresh without loading screen
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [isAuthenticated, fetchEmails]);

  return {
    emails,
    loading,
    backgroundLoading,
    error,
    isAuthenticated,
    authenticateGmail,
    fetchEmails,
    sendReply,
    sendEmail,
    checkAuthStatus,
    logoutGmail
  };
} 