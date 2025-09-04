"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Instagram, Play, Square, RefreshCw, CheckCircle, AlertCircle, Clock } from "lucide-react";

interface SyncStatus {
  isRunning: boolean;
  hasApi: boolean;
  nextSync: string;
}

export function InstagramSyncControl() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isRunning: false,
    hasApi: false,
    nextSync: 'Stopped'
  });
  const [loading, setLoading] = useState(false);

  // Instagram credentials (hardcoded for now, can be moved to env)
  const accessToken = "EAAO4h7vKgcABO2QtAl4mniiMQOoNuyZCn3FPuLwDR3AnaqIijuOj1O21zTAfIQfinlHLWdNiSUyyelsU8LQJsSYyue4H3fF7MZCdfr0yjHWgzqbSBVHtnqcE28lG8RGJcTMUEIHYj11fk5LHnV3rQiVIrC4BYzZAyhrmTFZCuiAtvr3BwL4pv0pX2l9GIZCUjwGXPN8m66gZDZD";
  const instagramBusinessAccountId = "17841475533389585";

  // Fetch sync status
  const fetchSyncStatus = async () => {
    try {
      const response = await fetch('/api/instagram/sync');
      const data = await response.json();
      
      if (data.success) {
        setSyncStatus(data.status);
      }
    } catch (error) {
      console.error('Error fetching Instagram sync status:', error);
    }
  };

  // Start sync
  const startSync = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/instagram/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'start',
          accessToken,
          instagramBusinessAccountId,
          intervalMs: 30000 // 30 seconds
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setSyncStatus(data.status);
        console.log('Instagram sync started successfully');
      } else {
        console.error('Failed to start Instagram sync:', data.error);
        alert(`Failed to start sync: ${data.error}`);
      }
    } catch (error) {
      console.error('Error starting Instagram sync:', error);
      alert('Error starting sync. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Stop sync
  const stopSync = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/instagram/sync', {
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
        console.log('Instagram sync stopped successfully');
      } else {
        console.error('Failed to stop Instagram sync:', data.error);
        alert(`Failed to stop sync: ${data.error}`);
      }
    } catch (error) {
      console.error('Error stopping Instagram sync:', error);
      alert('Error stopping sync. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Manual sync
  const manualSync = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/instagram/sync', {
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
        console.log('Instagram manual sync completed');
        alert('Manual sync completed successfully!');
      } else {
        console.error('Failed to perform Instagram manual sync:', data.error);
        alert(`Manual sync failed: ${data.error}`);
      }
    } catch (error) {
      console.error('Error performing Instagram manual sync:', error);
      alert('Error performing manual sync. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch status on component mount
  useEffect(() => {
    fetchSyncStatus();
    
    // Poll status every 10 seconds when running
    const interval = setInterval(() => {
      if (syncStatus.isRunning) {
        fetchSyncStatus();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [syncStatus.isRunning]);

  const getStatusIcon = () => {
    if (loading) {
      return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>;
    }
    
    if (syncStatus.isRunning) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    
    if (syncStatus.hasApi) {
      return <Clock className="h-4 w-4 text-orange-500" />;
    }
    
    return <AlertCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusText = () => {
    if (loading) return 'Processing...';
    if (syncStatus.isRunning) return 'Running';
    if (syncStatus.hasApi) return 'Ready';
    return 'Not Initialized';
  };

  const getStatusColor = () => {
    if (loading) return 'default';
    if (syncStatus.isRunning) return 'default';
    if (syncStatus.hasApi) return 'secondary';
    return 'destructive';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Instagram className="h-5 w-5 text-purple-600" />
          Instagram Message Sync
        </CardTitle>
        <CardDescription>
          Automatically sync Instagram messages from Graph API to Supabase
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-sm font-medium">
              Status: {getStatusText()}
            </span>
          </div>
          <Badge variant={getStatusColor() as any}>
            {syncStatus.isRunning ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        {/* Details */}
        {syncStatus.hasApi && (
          <div className="text-sm text-gray-600 space-y-1">
            <div>Next Sync: {syncStatus.nextSync}</div>
            <div>API: {syncStatus.hasApi ? '✅ Connected' : '❌ Not Connected'}</div>
            <div>Interval: 30 seconds</div>
          </div>
        )}

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
          <p>• The sync service will continuously fetch new messages from Instagram</p>
          <p>• All messages are stored in your Supabase database</p>
          <p>• Real-time updates are enabled for instant message notifications</p>
          <p>• Background sync also triggers automatically when you view messages</p>
        </div>
      </CardContent>
    </Card>
  );
} 