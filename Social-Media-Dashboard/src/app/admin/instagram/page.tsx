"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { InstagramSyncControl } from "@/components/InstagramSyncControl";
import { 
  Instagram, 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  RefreshCw, 
  Link, 
  MessageSquare,
  Bell,
  Eye,
  Send
} from "lucide-react";

interface SubscriptionResponse {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
  subscriptions?: {
    data: Array<{
      application: {
        category: string;
        link: string;
        name: string;
        namespace: string;
        id: string;
      };
      subscribed_fields: string[];
      callback_url: string;
      object: string;
    }>;
  };
  pageId?: string;
}

const InstagramAdminPage: React.FC = () => {
  const [pageId, setPageId] = useState<string>('');
  const [fields, setFields] = useState<string>('messages');
  const [subscriptions, setSubscriptions] = useState<SubscriptionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [verifyToken, setVerifyToken] = useState<string>('');

  // Load environment values on component mount
  useEffect(() => {
    setPageId(process.env.NEXT_PUBLIC_INSTAGRAM_BUSINESS_ACCOUNT_ID || '');
    setWebhookUrl(
      process.env.NEXT_PUBLIC_APP_URL 
        ? `${process.env.NEXT_PUBLIC_APP_URL}/api/instagram/webhook`
        : 'https://your-domain.com/api/instagram/webhook'
    );
    setVerifyToken(process.env.NEXT_PUBLIC_INSTAGRAM_VERIFY_TOKEN || 'your_verify_token');
    
    // Auto-load current subscriptions
    checkCurrentSubscriptions();
  }, []);

  const subscribeToMessages = async () => {
    if (!pageId.trim()) {
      setError('Page ID is required');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/instagram/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageId: pageId.trim(),
          fields: fields
        }),
      });

      const data: SubscriptionResponse = await response.json();

      if (data.success) {
        setSuccess(data.message || 'Successfully subscribed to Instagram messaging events');
        // Refresh subscriptions after successful subscription
        setTimeout(() => checkCurrentSubscriptions(), 1000);
      } else {
        setError(data.error || 'Failed to subscribe to messaging events');
      }
    } catch (err) {
      console.error('Subscription error:', err);
      setError('Network error occurred while subscribing');
    } finally {
      setLoading(false);
    }
  };

  const checkCurrentSubscriptions = async () => {
    try {
      const currentPageId = pageId || process.env.NEXT_PUBLIC_INSTAGRAM_BUSINESS_ACCOUNT_ID;
      if (!currentPageId) return;

      const response = await fetch(`/api/instagram/subscribe?pageId=${encodeURIComponent(currentPageId)}`);
      const data: SubscriptionResponse = await response.json();

      if (data.success) {
        setSubscriptions(data);
      } else {
        console.warn('Failed to check subscriptions:', data.error);
      }
    } catch (err) {
      console.error('Error checking subscriptions:', err);
    }
  };

  const testWebhook = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Test webhook verification
      const verificationUrl = `/api/instagram/webhook?hub.mode=subscribe&hub.verify_token=${encodeURIComponent(verifyToken)}&hub.challenge=test_challenge_123`;
      const verifyResponse = await fetch(verificationUrl);
      const verifyResult = await verifyResponse.text();

      if (verifyResponse.ok && verifyResult === 'test_challenge_123') {
        setSuccess('✅ Webhook verification successful! Your webhook is properly configured.');
      } else {
        setError(`❌ Webhook verification failed. Status: ${verifyResponse.status}, Response: ${verifyResult}`);
      }

      // Test message retrieval
      const messagesResponse = await fetch('/api/instagram/webhook?limit=5');
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

  const availableFields = [
    { value: 'messages', label: 'Messages', description: 'Direct messages and story replies' },
    { value: 'messaging_postbacks', label: 'Postbacks', description: 'Button clicks and quick replies' },
    { value: 'messaging_optins', label: 'Opt-ins', description: 'User opt-in events' },
    { value: 'message_reads', label: 'Read Receipts', description: 'Message read confirmations' },
    { value: 'messaging_reactions', label: 'Reactions', description: 'Message reactions' },
    { value: 'messaging_referrals', label: 'Referrals', description: 'Referral events' },
    { value: 'comments', label: 'Comments', description: 'Post and story comments' },
    { value: 'live_comments', label: 'Live Comments', description: 'Live video comments' }
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <Instagram className="h-8 w-8 text-pink-600" />
        <div>
          <h1 className="text-3xl font-bold">Instagram Administration</h1>
          <p className="text-muted-foreground">Manage Instagram webhook subscriptions and message sync</p>
        </div>
      </div>

      {/* Instagram Sync Control */}
      <InstagramSyncControl />

      {/* Configuration Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Current Configuration</span>
          </CardTitle>
          <CardDescription>Your current Instagram webhook and subscription settings</CardDescription>
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
        </CardContent>
      </Card>

      {/* Subscription Management */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscribe to Events */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="h-5 w-5" />
              <span>Subscribe to Events</span>
            </CardTitle>
            <CardDescription>Subscribe your Instagram page to webhook events</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="pageId">Instagram Business Account ID</Label>
              <Input
                id="pageId"
                placeholder="Enter your Instagram Business Account ID"
                value={pageId}
                onChange={(e) => setPageId(e.target.value)}
                className="mt-1"
              />
              <p className="text-sm text-muted-foreground mt-1">
                This should be your Instagram Business Account ID, not your Page ID
              </p>
            </div>

            <div>
              <Label htmlFor="fields">Subscription Fields</Label>
              <Select value={fields} onValueChange={setFields}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select fields to subscribe to" />
                </SelectTrigger>
                <SelectContent>
                  {availableFields.map((field) => (
                    <SelectItem key={field.value} value={field.value}>
                      <div className="flex flex-col">
                        <span>{field.label}</span>
                        <span className="text-xs text-muted-foreground">{field.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={subscribeToMessages} 
              disabled={loading || !pageId.trim()}
              className="w-full"
            >
              {loading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Subscribing...
                </>
              ) : (
                <>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Subscribe to Events
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Current Subscriptions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>Current Subscriptions</span>
            </CardTitle>
            <CardDescription>View your active webhook subscriptions</CardDescription>
          </CardHeader>
          <CardContent>
            {subscriptions?.subscriptions?.data && subscriptions.subscriptions.data.length > 0 ? (
              <div className="space-y-3">
                {subscriptions.subscriptions.data.map((sub, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{sub.application.name}</h4>
                      <Badge variant="secondary">{sub.object}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      <p>App ID: {sub.application.id}</p>
                      <p>Category: {sub.application.category}</p>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {sub.subscribed_fields.map((field) => (
                        <Badge key={field} variant="outline" className="text-xs">
                          {field}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No active subscriptions found</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={checkCurrentSubscriptions}
                  className="mt-2"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Webhook Testing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Send className="h-5 w-5" />
            <span>Test Webhook</span>
          </CardTitle>
          <CardDescription>Test your webhook configuration and message handling</CardDescription>
        </CardHeader>
        <CardContent>
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
          <CardDescription>Follow these steps to configure Instagram messaging</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">1. Facebook App Configuration</h4>
            <p className="text-sm text-muted-foreground">
              Ensure your Facebook App has the Instagram Basic Display API and Instagram Graph API products enabled.
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
          </div>
          
          <Separator />
          
          <div className="space-y-2">
            <h4 className="font-medium">3. Environment Variables</h4>
            <div className="text-sm space-y-1">
              <p><code>INSTAGRAM_ACCESS_TOKEN</code> - Your Instagram Graph API access token</p>
              <p><code>INSTAGRAM_BUSINESS_ACCOUNT_ID</code> - Your Instagram Business Account ID</p>
              <p><code>INSTAGRAM_WEBHOOK_VERIFY_TOKEN</code> - Webhook verification token</p>
              <p><code>NEXT_PUBLIC_APP_URL</code> - Your application's public URL</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InstagramAdminPage;
