'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface FacebookPage {
  id: string;
  name: string;
  category: string;
  hasAccessToken: boolean;
}

interface AuthResponse {
  success: boolean;
  oauthUrl?: string;
  message?: string;
  data?: {
    pages: FacebookPage[];
    totalPages: number;
  };
  error?: string;
  details?: string;
}

export function FacebookAuthTest() {
  const [loading, setLoading] = useState(false);
  const [authResponse, setAuthResponse] = useState<AuthResponse | null>(null);
  const [testResults, setTestResults] = useState<{
    pageId: string;
    success: boolean;
    message?: string;
    capabilities?: string[];
    details?: string;
    solutions?: string[];
    error?: string;
  } | null>(null);

  const initiateOAuth = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/facebook/callback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scopes: ['pages_show_list', 'pages_manage_posts', 'pages_read_engagement']
        })
      });

      const data = await response.json();
      setAuthResponse(data);

      if (data.success && data.oauthUrl) {
        // Open OAuth URL in new tab
        window.open(data.oauthUrl, '_blank');
      }
    } catch (error) {
      console.error('Error initiating OAuth:', error);
      setAuthResponse({
        success: false,
        error: 'Failed to initiate OAuth',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    setLoading(false);
  };

  const testPageToken = async (pageId: string, pageAccessToken: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/facebook/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pageAccessToken,
          pageId
        })
      });

      const data = await response.json();
      setTestResults({ pageId, ...data });
    } catch (error) {
      console.error('Error testing token:', error);
      setTestResults({
        pageId,
        success: false,
        error: 'Failed to test token',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
    setLoading(false);
  };

  const checkExistingTokens = async () => {
    setLoading(true);
    try {
      // This would check if there are any stored tokens
      const response = await fetch('/api/facebook/token');
      const data = await response.json();
      setAuthResponse(data);
    } catch (error) {
      console.error('Error checking tokens:', error);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>Facebook Page Access Token Troubleshooter</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-wrap">
            <Button 
              onClick={initiateOAuth} 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? 'Loading...' : 'Start OAuth Flow'}
            </Button>
            
            <Button 
              onClick={checkExistingTokens} 
              disabled={loading}
              variant="outline"
            >
              Check Existing Tokens
            </Button>
          </div>

          {authResponse && (
            <div className="mt-4 p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">
                {authResponse.success ? 'Success' : 'Error'}
              </h3>
              
              {authResponse.success ? (
                <div>
                  <p className="text-green-600 mb-2">{authResponse.message}</p>
                  
                  {authResponse.oauthUrl && (
                    <div className="mb-4">
                      <p className="mb-2">OAuth URL (should open in new tab):</p>
                      <code className="block p-2 bg-gray-100 rounded text-sm break-all">
                        {authResponse.oauthUrl}
                      </code>
                    </div>
                  )}

                  {authResponse.data?.pages && (
                    <div>
                      <h4 className="font-medium mb-2">
                        Available Pages ({authResponse.data.totalPages}):
                      </h4>
                      <div className="space-y-2">
                        {authResponse.data.pages.map((page) => (
                          <div key={page.id} className="p-2 border rounded">
                            <div className="flex justify-between items-center">
                              <div>
                                <strong>{page.name}</strong>
                                <span className="text-sm text-gray-500 ml-2">
                                  ({page.category})
                                </span>
                                <span className={`ml-2 px-2 py-1 rounded text-xs ${
                                  page.hasAccessToken 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {page.hasAccessToken ? 'Has Token' : 'No Token'}
                                </span>
                              </div>
                              {page.hasAccessToken && (
                                <Button
                                  size="sm"
                                  onClick={() => testPageToken(page.id, 'token_from_oauth')}
                                  disabled={loading}
                                >
                                  Test Token
                                </Button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-red-600 mb-2">{authResponse.error}</p>
                  {authResponse.details && (
                    <code className="block p-2 bg-red-50 rounded text-sm">
                      {authResponse.details}
                    </code>
                  )}
                </div>
              )}
            </div>
          )}

          {testResults && (
            <div className="mt-4 p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Token Test Results</h3>
              <div className={`p-3 rounded ${
                testResults.success ? 'bg-green-50' : 'bg-red-50'
              }`}>
                {testResults.success ? (
                  <div>
                    <p className="text-green-600 font-medium">✅ Token is valid!</p>
                    <p className="text-sm mt-1">{testResults.message}</p>
                    {testResults.capabilities && (
                      <ul className="text-sm mt-2 list-disc list-inside">
                        {testResults.capabilities.map((capability: string, index: number) => (
                          <li key={index}>{capability}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="text-red-600 font-medium">❌ Token test failed</p>
                    <p className="text-sm mt-1">{testResults.details}</p>
                    {testResults.solutions && (
                      <div className="mt-2">
                        <p className="text-sm font-medium">Solutions:</p>
                        <ul className="text-sm list-disc list-inside">
                          {testResults.solutions.map((solution: string, index: number) => (
                            <li key={index}>{solution}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium mb-2">Instructions:</h4>
            <ol className="text-sm list-decimal list-inside space-y-1">
              <li>Click &quot;Start OAuth Flow&quot; to begin Facebook authorization</li>
              <li>A new tab will open with Facebook&apos;s authorization page</li>
              <li>Log in and authorize your app to access your pages</li>
              <li>You&apos;ll be redirected back to get your Page Access Tokens</li>
              <li>Use &quot;Test Token&quot; to verify the tokens work correctly</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 