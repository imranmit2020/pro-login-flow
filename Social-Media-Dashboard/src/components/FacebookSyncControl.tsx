"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, Square, RefreshCw, Settings, AlertCircle, CheckCircle } from "lucide-react";

interface SyncStatus {
  isRunning: boolean;
  hasApi: boolean;
  nextSync: string;
}

export function FacebookSyncControl() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isRunning: false,
    hasApi: false,
    nextSync: 'Stopped'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pageAccessToken, setPageAccessToken] = useState('');
  const [pageId, setPageId] = useState('');
  const [intervalMs, setIntervalMs] = useState(30000);

  // Load saved credentials from localStorage
  useEffect(() => {
    const savedToken = localStorage.getItem('facebook_page_access_token');
    const savedPageId = localStorage.getItem('facebook_page_id');
    const savedInterval = localStorage.getItem('facebook_sync_interval');
    
    if (savedToken) setPageAccessToken(savedToken);
    if (savedPageId) setPageId(savedPageId);
    if (savedInterval) setIntervalMs(parseInt(savedInterval));
  }, []);

  // Fetch sync status
  const fetchSyncStatus = async () => {
    try {
      const response = await fetch('/api/facebook/sync');
      const data = await response.json();
      
      if (data.success) {
        setSyncStatus(data.status);
      }
    } catch (err) {
      console.error('Error fetching sync status:', err);
    }
  };

  // Start sync
  const startSync = async () => {
    if (!pageAccessToken || !pageId) {
      setError('Please provide both Page Access Token and Page ID');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/facebook/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'start',
          pageAccessToken,
          pageId,
          intervalMs
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setSyncStatus(data.status);
        
        // Save credentials to localStorage
        localStorage.setItem('facebook_page_access_token', pageAccessToken);
        localStorage.setItem('facebook_page_id', pageId);
        localStorage.setItem('facebook_sync_interval', intervalMs.toString());
      } else {
        setError(data.error || 'Failed to start sync');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Stop sync
  const stopSync = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/facebook/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'stop'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setSyncStatus(data.status);
      } else {
        setError(data.error || 'Failed to stop sync');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Manual sync
  const manualSync = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/facebook/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'sync'
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setSyncStatus(data.status);
      } else {
        setError(data.error || 'Failed to sync');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  // Initial status fetch
  useEffect(() => {
    fetchSyncStatus();
    
    // Refresh status every 10 seconds
    const interval = setInterval(fetchSyncStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Facebook Sync Control
        </CardTitle>
        <CardDescription>
          Configure and control Facebook message synchronization
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Display */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Status:</span>
            <Badge variant={syncStatus.isRunning ? "default" : "secondary"}>
              {syncStatus.isRunning ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Running
                </>
              ) : (
                <>
                  <Square className="h-3 w-3 mr-1" />
                  Stopped
                </>
              )}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">API:</span>
            <Badge variant={syncStatus.hasApi ? "default" : "destructive"}>
              {syncStatus.hasApi ? 'Connected' : 'Not Connected'}
            </Badge>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {/* Configuration */}
        <div className="space-y-3">
          <div>
            <Label htmlFor="pageAccessToken">Page Access Token</Label>
            <Input
              id="pageAccessToken"
              type="password"
              value={pageAccessToken}
              onChange={(e) => setPageAccessToken(e.target.value)}
              placeholder="Enter your Facebook Page Access Token"
            />
          </div>
          
          <div>
            <Label htmlFor="pageId">Page ID</Label>
            <Input
              id="pageId"
              value={pageId}
              onChange={(e) => setPageId(e.target.value)}
              placeholder="Enter your Facebook Page ID"
            />
          </div>
          
          <div>
            <Label htmlFor="interval">Sync Interval (ms)</Label>
            <Input
              id="interval"
              type="number"
              value={intervalMs}
              onChange={(e) => setIntervalMs(parseInt(e.target.value) || 30000)}
              min="5000"
              step="1000"
            />
            <p className="text-xs text-gray-500 mt-1">
              Minimum 5 seconds (5000ms). Default is 30 seconds.
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex gap-2">
          <Button
            onClick={startSync}
            disabled={loading || syncStatus.isRunning}
            variant="default"
            size="sm"
          >
            <Play className="h-4 w-4 mr-2" />
            Start Sync
          </Button>
          
          <Button
            onClick={stopSync}
            disabled={loading || !syncStatus.isRunning}
            variant="destructive"
            size="sm"
          >
            <Square className="h-4 w-4 mr-2" />
            Stop Sync
          </Button>
          
          <Button
            onClick={manualSync}
            disabled={loading}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Manual Sync
          </Button>
        </div>

        {/* Information */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• The sync service will continuously fetch new messages from Facebook</p>
          <p>• All messages are stored in your Supabase database</p>
          <p>• Real-time updates are enabled for instant message notifications</p>
        </div>
      </CardContent>
    </Card>
  );
}