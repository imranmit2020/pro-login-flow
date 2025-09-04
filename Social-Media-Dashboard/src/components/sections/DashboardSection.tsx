"use client";

import { useState, useEffect } from "react";
import { FutureCard, GlassCard, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar } from "react-chartjs-2";
import { Chart, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";
import { MessageCircle, Users, Facebook, Instagram, Mail, ArrowRight, Activity, TrendingUp, Zap, BarChart3, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

Chart.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface AnalyticsData {
  totalMessages: number;
  totalMessagesToday: number;
  newContacts: number;
  platformStats: {
    facebook: {
      total: number;
      today: number;
      connected: boolean;
    };
    instagram: {
      total: number;
      today: number;
      connected: boolean;
    };
    gmail: {
      total: number;
      today: number;
      connected: boolean;
    };
  };
  connectionStatus: {
    facebook: boolean;
    instagram: boolean;
    gmail: boolean;
    connectedCount: number;
  };
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
      labels: {
        color: 'rgba(255, 255, 255, 0.8)',
        font: {
          family: 'system-ui, -apple-system',
          size: 12
        }
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      titleColor: 'rgba(255, 255, 255, 1)',
      bodyColor: 'rgba(255, 255, 255, 0.9)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      cornerRadius: 8,
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      grid: {
        color: 'rgba(255, 255, 255, 0.1)',
        drawBorder: false,
      },
      ticks: {
        color: 'rgba(255, 255, 255, 0.7)',
      }
    },
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: 'rgba(255, 255, 255, 0.7)',
      }
    }
  }
};

export function DashboardSection() {
  const router = useRouter();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics/overview');
      const result = await response.json();
      
      if (result.success) {
        setAnalyticsData(result.data);
        setError(null);
      } else {
        setError(result.message || 'Failed to fetch analytics');
      }
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Create chart data from real analytics
  const platformMessagesData = analyticsData ? {
    labels: ["Facebook", "Instagram", "Gmail"],
    datasets: [
      {
        label: "Messages Today",
        data: [
          analyticsData.platformStats.facebook.today,
          analyticsData.platformStats.instagram.today,
          analyticsData.platformStats.gmail.today
        ],
        backgroundColor: [
          "rgba(24, 119, 242, 0.8)",
          "rgba(228, 64, 95, 0.8)",
          "rgba(234, 67, 53, 0.8)"
        ],
        borderColor: [
          "rgba(24, 119, 242, 1)",
          "rgba(228, 64, 95, 1)",
          "rgba(234, 67, 53, 1)"
        ],
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  } : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error || !analyticsData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
          <p className="text-red-500 mb-4">{error || 'Failed to load dashboard data'}</p>
          <Button onClick={fetchAnalytics} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Hero Header */}
      <div className="text-center mb-12">
        <div className="relative">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 via-blue-500 to-teal-500 bg-clip-text text-transparent animate-pulse-slow">
            Unified Message Manager
          </h1>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-blue-500/20 to-teal-500/20 blur-3xl -z-10 animate-pulse-slow" />
        </div>
        <p className="text-muted-foreground text-xl max-w-3xl mx-auto">
          Manage Facebook, Instagram, and Gmail messages with next-generation AI-powered insights
        </p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
            <Activity className="w-3 h-3 mr-1" />
            Live
          </Badge>
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            {analyticsData.connectionStatus.connectedCount} Platforms Connected
          </Badge>
        </div>
      </div>

      {/* Enhanced Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        <FutureCard className="group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
            <div className="p-2 rounded-full bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
              <MessageCircle className="h-5 w-5 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500 mb-1">{analyticsData.totalMessages}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-green-500" />
              {analyticsData.totalMessagesToday} messages today
            </p>
          </CardContent>
        </FutureCard>

        <FutureCard className="group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Contacts</CardTitle>
            <div className="p-2 rounded-full bg-green-500/20 group-hover:bg-green-500/30 transition-colors">
              <Users className="h-5 w-5 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500 mb-1">{analyticsData.newContacts}</div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-green-500" />
              This week
            </p>
          </CardContent>
        </FutureCard>
      </div>

      {/* Enhanced Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-500" />
              Messages by Platform (Today)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              {platformMessagesData && <Bar data={platformMessagesData} options={chartOptions} />}
            </div>
          </CardContent>
        </GlassCard>

        <GlassCard>
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-500" />
              Platform Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <div className={`p-4 rounded-xl border transition-colors ${analyticsData.connectionStatus.facebook ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Facebook className="h-5 w-5 text-blue-500" />
                      <span className="font-medium">Facebook</span>
                    </div>
                    <Badge className={analyticsData.connectionStatus.facebook ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                      {analyticsData.connectionStatus.facebook ? 'Connected' : 'Disconnected'}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {analyticsData.platformStats.facebook.total} total messages
                  </div>
                </div>

                <div className={`p-4 rounded-xl border transition-colors ${analyticsData.connectionStatus.instagram ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Instagram className="h-5 w-5 text-pink-500" />
                      <span className="font-medium">Instagram</span>
                    </div>
                    <Badge className={analyticsData.connectionStatus.instagram ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                      {analyticsData.connectionStatus.instagram ? 'Connected' : 'Disconnected'}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {analyticsData.platformStats.instagram.total} total messages
                  </div>
                </div>

                <div className={`p-4 rounded-xl border transition-colors ${analyticsData.connectionStatus.gmail ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-5 w-5 text-red-500" />
                      <span className="font-medium">Gmail</span>
                    </div>
                    <Badge className={analyticsData.connectionStatus.gmail ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                      {analyticsData.connectionStatus.gmail ? 'Connected' : 'Disconnected'}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {analyticsData.platformStats.gmail.total} total messages
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </GlassCard>
      </div>

      {/* Enhanced Platform Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="group hover:scale-105 transition-all duration-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                <Facebook className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <div className="text-lg">Facebook Messages</div>
                <Badge className={`text-xs ${analyticsData.connectionStatus.facebook ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                  {analyticsData.connectionStatus.facebook ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <div className="text-xl font-bold text-blue-500">{analyticsData.platformStats.facebook.today}</div>
                  <div className="text-xs text-muted-foreground">Today</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                  <div className="text-xl font-bold text-blue-500">{analyticsData.platformStats.facebook.total}</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
              </div>
              <Button 
                size="sm" 
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-blue-500/25"
                onClick={() => router.push('/?section=unified-messages')}
              >
                View Facebook Messages
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardContent>
        </GlassCard>

        <GlassCard className="group hover:scale-105 transition-all duration-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
                <Instagram className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <div className="text-lg">Instagram Messages</div>
                <Badge className={`text-xs ${analyticsData.connectionStatus.instagram ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                  {analyticsData.connectionStatus.instagram ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <div className="text-xl font-bold text-purple-500">{analyticsData.platformStats.instagram.today}</div>
                  <div className="text-xs text-muted-foreground">Today</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                  <div className="text-xl font-bold text-purple-500">{analyticsData.platformStats.instagram.total}</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
              </div>
              <Button 
                size="sm" 
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 shadow-lg hover:shadow-purple-500/25"
                onClick={() => router.push('/?section=unified-messages')}
              >
                View Instagram DMs
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardContent>
        </GlassCard>

        <GlassCard className="group hover:scale-105 transition-all duration-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-red-500/20 group-hover:bg-red-500/30 transition-colors">
                <Mail className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <div className="text-lg">Gmail Messages</div>
                <Badge className={`text-xs ${analyticsData.connectionStatus.gmail ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                  {analyticsData.connectionStatus.gmail ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <div className="text-xl font-bold text-red-500">{analyticsData.platformStats.gmail.today}</div>
                  <div className="text-xs text-muted-foreground">Today</div>
                </div>
                <div className="text-center p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <div className="text-xl font-bold text-red-500">{analyticsData.platformStats.gmail.total}</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
              </div>
              <Button 
                size="sm" 
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg hover:shadow-red-500/25"
                onClick={() => router.push('/?section=unified-messages')}
              >
                {analyticsData.connectionStatus.gmail ? 'View Gmail Inbox' : 'Connect Gmail'}
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardContent>
        </GlassCard>
      </div>

      {/* Enhanced Quick Actions */}
      <FutureCard>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-500" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              className="h-auto p-6 flex-col items-center space-y-3 bg-gradient-to-br from-blue-500/10 to-blue-500/5 hover:from-blue-500/20 hover:to-blue-500/10 border border-blue-500/20 group" 
              variant="outline"
              onClick={() => router.push('/?section=unified-messages')}
            >
              <div className="p-3 rounded-full bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                <MessageCircle className="h-6 w-6 text-blue-500" />
              </div>
              <div className="text-center">
                <div className="font-semibold text-base">View All Messages</div>
                <div className="text-xs text-muted-foreground">Unified inbox</div>
              </div>
            </Button>

            <Button 
              className="h-auto p-6 flex-col items-center space-y-3 bg-gradient-to-br from-green-500/10 to-green-500/5 hover:from-green-500/20 hover:to-green-500/10 border border-green-500/20 group" 
              variant="outline"
              onClick={() => router.push('/?section=tasks')}
            >
              <div className="p-3 rounded-full bg-green-500/20 group-hover:bg-green-500/30 transition-colors">
                <BarChart3 className="h-6 w-6 text-green-500" />
              </div>
              <div className="text-center">
                <div className="font-semibold text-base">Task Management</div>
                <div className="text-xs text-muted-foreground">Organize workflow</div>
              </div>
            </Button>

            <Button 
              className="h-auto p-6 flex-col items-center space-y-3 bg-gradient-to-br from-purple-500/10 to-purple-500/5 hover:from-purple-500/20 hover:to-purple-500/10 border border-purple-500/20 group" 
              variant="outline"
              onClick={() => router.push('/?section=analytics')}
            >
              <div className="p-3 rounded-full bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
                <TrendingUp className="h-6 w-6 text-purple-500" />
              </div>
              <div className="text-center">
                <div className="font-semibold text-base">Analytics</div>
                <div className="text-xs text-muted-foreground">View insights</div>
              </div>
            </Button>

            <Button 
              className="h-auto p-6 flex-col items-center space-y-3 bg-gradient-to-br from-orange-500/10 to-orange-500/5 hover:from-orange-500/20 hover:to-orange-500/10 border border-orange-500/20 group" 
              variant="outline"
              onClick={() => router.push('/?section=calls')}
            >
              <div className="p-3 rounded-full bg-orange-500/20 group-hover:bg-orange-500/30 transition-colors">
                <Users className="h-6 w-6 text-orange-500" />
              </div>
              <div className="text-center">
                <div className="font-semibold text-base">Appointments</div>
                <div className="text-xs text-muted-foreground">Manage calls</div>
              </div>
            </Button>
          </div>
          
          <div className="mt-6 flex items-center justify-center">
            <Button 
              onClick={fetchAnalytics}
              variant="outline" 
              size="sm"
              className="text-xs"
            >
              <Activity className="h-3 w-3 mr-1" />
              Refresh Data
            </Button>
          </div>
        </CardContent>
      </FutureCard>
    </div>
  );
}
