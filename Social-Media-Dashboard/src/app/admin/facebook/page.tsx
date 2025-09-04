"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  MessageCircle, 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Link, 
  Send,
  Eye,
  Bell
} from "lucide-react";

interface WebhookTestResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
}

const FacebookMessengerAdminPage: React.FC = () => {
  const [pageId, setPageId] = useState<string>('');
  const [accessToken, setAccessToken] = useState<string>('');
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [verifyToken, setVerifyToken] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [messageStats, setMessageStats] = useState<any>(null);

  // Load environment values on component mount
  useEffect(() => {
    setPageId(process.env.NEXT_PUBLIC_FACEBOOK_PAGE_ID || '');
    setAccessToken(process.env.NEXT_PUBLIC_FACEBOOK_ACCESS_TOKEN || '');
    setVerifyToken(process.env.NEXT_PUBLIC_FACEBOOK_VERIFY_TOKEN || 'my_verify_token');
    setWebhookUrl(
      process.env.NEXT_PUBLIC_APP_URL 
        ? `${process.env.NEXT_PUBLIC_APP_URL}/api/facebook/messenger/webhook`
        : 'https://your-domain.com/api/facebook/messenger/webhook'
    );
    
    // Auto-load current messages
    fetchMessages();
  }, []);

  const testWebhook = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Test webhook verification
      const verificationUrl = `/api/facebook/messenger/webhook?hub.mode=subscribe&hub.verify_token=${encodeURIComponent(verifyToken)}&hub.challenge=test_challenge_456`;
      const verifyResponse = await fetch(verificationUrl);
      const verifyResult = await verifyResponse.text();

      if (verifyResponse.ok && verifyResult === 'test_challenge_456') {
        setSuccess('✅ Facebook Messenger webhook verification successful!');
      } else {
        setError(`❌ Webhook verification failed. Status: ${verifyResponse.status}, Response: ${verifyResult}`);
      }

      // Test message retrieval
      const messagesResponse = await fetch('/api/facebook/messenger/webhook?limit=5');
      const messagesData = await messagesResponse.json();

      if (messagesData.success) {
        setSuccess(prev => 
          prev + `\n📥 Message retrieval test passed. Found ${messagesData.data?.messages?.length || 0} stored messages.`
        );
      }
    } catch (err) {
      console.error('Webhook test error:', err);
      setError('Network error occurred while testing webhook');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch('/api/facebook/messenger/webhook?limit=10');
      const data = await response.json();

      if (data.success && data.data) {
        setMessages(data.data.messages || []);
        setMessageStats(data.data.stats || null);
      }
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const sendTestMessage = async () => {
    if (!pageId.trim()) {
      setError('Page ID is required for sending test message');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Simulate a test webhook message
      const testPayload = {
        object: 'page',
        entry: [{
          id: pageId,
          messaging: [{
            sender: { id: 'test_facebook_user_' + Date.now() },
            recipient: { id: pageId },
            timestamp: Date.now(),
            message: {
              mid: 'test_message_' + Date.now(),
              text: 'Hello from Facebook Messenger admin test! 🚀'
            }
          }]
        }]
      };

      const response = await fetch('/api/facebook/messenger/webhook', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload),
      });

      if (response.ok) {
        setSuccess('✅ Test message sent successfully! Check the messages section below.');
        // Refresh messages after sending test
        setTimeout(fetchMessages, 1000);
      } else {
        setError('❌ Failed to send test message');
      }
    } catch (err) {
      console.error('Error sending test message:', err);
      setError('Network error occurred while sending test message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <MessageCircle className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Facebook Messenger Administration</h1>
          <p className="text-muted-foreground">Manage Facebook Messenger webhook and test messaging integration</p>
        </div>
      </div>

      {/* Configuration Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Current Configuration</span>
          </CardTitle>
          <CardDescription>Your current Facebook Messenger webhook settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Webhook URL</Label>
              <div className="flex items-center space-x-2 mt-1">
                <code className="bg-muted px-2 py-1 rounded text-sm flex-1">{webhookUrl}</code>
                <Link className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <div>
              <Label>Verify Token</Label>
              <div className="flex items-center space-x-2 mt-1">
                <code className="bg-muted px-2 py-1 rounded text-sm flex-1">{verifyToken}</code>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Page ID</Label>
              <div className="flex items-center space-x-2 mt-1">
                <code className="bg-muted px-2 py-1 rounded text-sm flex-1">{pageId || 'Not configured'}</code>
              </div>
            </div>
            <div>
              <Label>Access Token Status</Label>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant={accessToken ? 'default' : 'destructive'}>
                  {accessToken ? 'Configured' : 'Missing'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Testing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Webhook Testing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Send className="h-5 w-5" />
              <span>Test Webhook</span>
            </CardTitle>
            <CardDescription>Test your webhook configuration and message handling</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={testWebhook} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Test Webhook Configuration
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Message Testing */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5" />
              <span>Test Message</span>
            </CardTitle>
            <CardDescription>Send a test message to verify storage and processing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="testPageId">Facebook Page ID</Label>
              <Input
                id="testPageId"
                placeholder="Enter your Facebook Page ID"
                value={pageId}
                onChange={(e) => setPageId(e.target.value)}
                className="mt-1"
              />
            </div>
            <Button onClick={sendTestMessage} disabled={loading || !pageId.trim()} className="w-full">
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Send Test Message
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Message Statistics */}
      {messageStats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Message Statistics</span>
            </CardTitle>
            <CardDescription>Overview of stored Facebook Messenger messages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{messageStats.totalMessages}</div>
                <div className="text-sm text-muted-foreground">Total Messages</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{messageStats.unreadMessages}</div>
                <div className="text-sm text-muted-foreground">Unread Messages</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{messageStats.totalMessages - messageStats.unreadMessages}</div>
                <div className="text-sm text-muted-foreground">Read Messages</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{messages.length}</div>
                <div className="text-sm text-muted-foreground">Recent Messages</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Messages */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5" />
              <span>Recent Messages</span>
            </div>
            <Button variant="outline" size="sm" onClick={fetchMessages}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </CardTitle>
          <CardDescription>Latest Facebook Messenger messages received</CardDescription>
        </CardHeader>
        <CardContent>
          {messages.length > 0 ? (
            <div className="space-y-3">
              {messages.map((message, index) => (
                <div key={message.id || index} className="border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">Messenger</Badge>
                      <Badge variant={message.status === 'new' ? 'destructive' : 'default'}>
                        {message.status}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {new Date(message.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm mb-2">{message.content?.text || 'No text content'}</p>
                  <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                    <span>From: {message.senderId}</span>
                    <span>Type: {message.messageType}</span>
                    {message.hasAttachments && (
                      <Badge variant="outline" className="text-xs">Has Attachments</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No messages found</p>
              <p className="text-sm">Send a test message to see it appear here</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            <pre className="whitespace-pre-wrap">{success}</pre>
          </AlertDescription>
        </Alert>
      )}

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
          <CardDescription>Follow these steps to configure Facebook Messenger</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">1. Facebook App Configuration</h4>
            <p className="text-sm text-muted-foreground">
              Ensure your Facebook App has the Messenger API product enabled and your Facebook Page is connected.
            </p>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <h4 className="font-medium">2. Webhook Configuration</h4>
            <p className="text-sm text-muted-foreground">
              In your Facebook App dashboard, configure the webhook URL: <code>{webhookUrl}</code>
            </p>
            <p className="text-sm text-muted-foreground">
              Use verify token: <code>{verifyToken}</code>
            </p>
            <p className="text-sm text-muted-foreground">
              Subscribe to webhook fields: <code>messages</code>, <code>messaging_postbacks</code>, <code>message_deliveries</code>, <code>message_reads</code>
            </p>
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <h4 className="font-medium">3. Environment Variables</h4>
            <div className="text-sm space-y-1">
              <p><code>FACEBOOK_ACCESS_TOKEN</code> - Your Facebook Page Access Token</p>
              <p><code>FACEBOOK_PAGE_ID</code> - Your Facebook Page ID</p>
              <p><code>FACEBOOK_VERIFY_TOKEN</code> - Webhook verification token</p>
              <p><code>NEXT_PUBLIC_APP_URL</code> - Your application's public URL</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FacebookMessengerAdminPage;
