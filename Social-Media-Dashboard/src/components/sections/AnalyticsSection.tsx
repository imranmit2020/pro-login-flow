"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  TrendingUp, 
  CheckSquare, 
  Mail, 
  Calendar, 
  Share2, 
  Phone, 
  CalendarDays,
  Users,
  Activity,
  Target,
  Loader2,
  AlertCircle,
  RefreshCw
} from "lucide-react";

interface AnalyticsData {
  tasks: {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
    completionRate: number;
  };
  emails: {
    total: number;
    sent: number;
    received: number;
    openRate: number;
    responseRate: number;
  };
  schedule: {
    total: number;
    confirmed: number;
    pending: number;
    cancelled: number;
    utilizationRate: number;
  };
  social: {
    total: number;
    engagement: number;
    followers: number;
    reach: number;
    engagementRate: number;
  };
  calls: {
    total: number;
    completed: number;
    missed: number;
    pending: number;
    successRate: number;
    usedCredits?: number;
    remainingCredits?: number;
    totalCredits?: number;
  };
  calendar: {
    total: number;
    appointments: number;
    meetings: number;
    events: number;
    bookingRate: number;
  };
  overview: {
    totalActivities: number;
    completed: number;
    successRate: number;
    patients: number;
  };
}

export function AnalyticsSection({ 
  subSection, 
  onAnalyticsSubSelect 
}: { 
  subSection?: string;
  onAnalyticsSubSelect?: (subSection: string) => void;
}) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  // Fetch analytics data from the comprehensive API
  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/analytics/comprehensive');
      const result = await response.json();
      
      if (result.success) {
        setAnalyticsData(result.data);
        setLastUpdated(result.lastUpdated);
      } else {
        setError(result.message || 'Failed to fetch analytics data');
      }
    } catch (err) {
      setError('Failed to load analytics data');
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  // Auto-refresh data every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      fetchAnalyticsData();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [fetchAnalyticsData]);

  // Create analytics categories from real data
  const analyticsCategories = analyticsData ? [
    {
      key: "tasks",
      label: "Tasks Analytics",
      icon: CheckSquare,
      color: "text-green-600",
      bgColor: "bg-green-50 border-green-200",
      stats: {
        total: analyticsData.tasks.total,
        completed: analyticsData.tasks.completed,
        pending: analyticsData.tasks.pending,
        overdue: analyticsData.tasks.overdue,
        completionRate: analyticsData.tasks.completionRate
      }
    },
    {
      key: "social",
      label: "Social Analytics",
      icon: Share2,
      color: "text-pink-600",
      bgColor: "bg-pink-50 border-pink-200",
      stats: {
        total: analyticsData.social.total,
        engagement: analyticsData.social.engagement,
        followers: analyticsData.social.followers,
        reach: analyticsData.social.reach,
        engagementRate: analyticsData.social.engagementRate
      }
    },
    {
      key: "calls",
      label: "Calls Analytics",
      icon: Phone,
      color: "text-red-600",
      bgColor: "bg-red-50 border-red-200",
      stats: {
        total: analyticsData.calls.total,
        completed: analyticsData.calls.completed,
        missed: analyticsData.calls.missed,
        pending: analyticsData.calls.pending,
        successRate: analyticsData.calls.successRate,
        usedCredits: analyticsData.calls.usedCredits,
        remainingCredits: analyticsData.calls.remainingCredits,
        totalCredits: analyticsData.calls.totalCredits
      }
    },
    {
      key: "calendar",
      label: "Calendar Analytics",
      icon: CalendarDays,
      color: "text-teal-600",
      bgColor: "bg-teal-50 border-teal-200",
      stats: {
        total: analyticsData.calendar.total,
        appointments: analyticsData.calendar.appointments,
        meetings: analyticsData.calendar.meetings,
        events: analyticsData.calendar.events,
        bookingRate: analyticsData.calendar.bookingRate
      }
    }
  ] : [];

  // Loading state
  if (loading && !analyticsData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-muted-foreground">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !analyticsData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-500" />
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchAnalyticsData} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // If a specific sub-section is selected, show detailed analytics for that category
  if (subSection && subSection.startsWith("analytics-") && analyticsData) {
    const categoryKey = subSection.replace("analytics-", "");
    const category = analyticsCategories.find(cat => cat.key === categoryKey);
    
    if (category) {
      return (
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${category.bgColor}`}>
                <category.icon className={`w-6 h-6 ${category.color}`} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{category.label}</h1>
                <p className="text-gray-600 mt-1">Real-time analytics and insights</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={fetchAnalyticsData} variant="outline" disabled={loading}>
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>

          {/* Real-time Data Badge */}
          <div className="flex items-center gap-2">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              <Activity className="w-3 h-3 mr-1" />
              Live Data
            </Badge>
            {lastUpdated && (
              <span className="text-xs text-gray-500">
                Last updated: {new Date(lastUpdated).toLocaleTimeString()}
              </span>
            )}
          </div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Object.entries(category.stats).map(([key, value]) => (
              <Card key={key} className={category.bgColor}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`${category.color} text-sm font-medium capitalize`}>
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {typeof value === 'number' && key.toLowerCase().includes('rate') 
                          ? `${value}%` 
                          : typeof value === 'number' && key.includes('Credits')
                          ? value.toLocaleString()
                          : value
                        }
                      </p>
                    </div>
                    <div className={`p-2 rounded-full ${category.bgColor}`}>
                      <TrendingUp className={`w-5 h-5 ${category.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Special Cards for Calls Analytics */}
          {categoryKey === 'calls' && analyticsData.calls.usedCredits !== undefined && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-sm font-medium">Credits Used</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {analyticsData.calls.usedCredits?.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-2 rounded-full bg-blue-100">
                      <Activity className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-green-50 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 text-sm font-medium">Credits Remaining</p>
                      <p className="text-2xl font-bold text-green-900">
                        {analyticsData.calls.remainingCredits?.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-2 rounded-full bg-green-100">
                      <Target className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-600 text-sm font-medium">Total Credits</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {analyticsData.calls.totalCredits?.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-2 rounded-full bg-purple-100">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Charts Placeholder */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
                <CardDescription>Track performance over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Chart visualization coming soon</p>
                    <p className="text-xs text-gray-400">Real-time data integration complete</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Breakdown</CardTitle>
                <CardDescription>Distribution analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <Activity className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500">Pie chart coming soon</p>
                    <p className="text-xs text-gray-400">Using live database data</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }
  }

  // Default analytics overview with real data
  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-500">No analytics data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Overview</h1>
          <p className="text-gray-600 mt-1">Real-time insights across all practice areas</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchAnalyticsData} variant="outline" disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </Button>
        </div>
      </div>

      {/* Real-time Data Indicator */}
      <div className="flex items-center gap-2">
        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
          <Activity className="w-3 h-3 mr-1" />
          Live Data
        </Badge>
        {lastUpdated && (
          <span className="text-xs text-gray-500">
            Last updated: {new Date(lastUpdated).toLocaleTimeString()}
          </span>
        )}
      </div>



      {/* Category Analytics Cards with Real Data */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {analyticsCategories.map((category) => (
          <Card key={category.key} className={`hover:shadow-lg transition-shadow cursor-pointer ${category.bgColor}`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-lg bg-white/80`}>
                    <category.icon className={`w-6 h-6 ${category.color}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-gray-900">{category.label}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {category.stats.total} total items
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Success Rate</span>
                                    <span className="font-semibold text-gray-900">
                    {Object.entries(category.stats).find(([key]) => key.includes('Rate'))?.[1] ||
                     Math.round((category.stats.completed || category.stats.appointments || 0) / (category.stats.total || 1) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-white/60 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${category.color.replace('text-', 'bg-')}`}
                    style={{ 
                      width: `${Object.entries(category.stats).find(([key]) => key.includes('Rate'))?.[1] || 
                               Math.round((category.stats.completed || category.stats.appointments || 0) / (category.stats.total || 1) * 100)}%` 
                    }}
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {category.stats.completed || category.stats.appointments || 0} Active
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {category.stats.pending || category.stats.missed || 0} Pending
                  </Badge>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className={`${category.color} hover:${category.bgColor}`}
                  onClick={() => {
                    if (onAnalyticsSubSelect) {
                      onAnalyticsSubSelect(`analytics-${category.key}`);
                    }
                  }}
                >
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Key Insights with Real Data */}
      <Card>
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
          <CardDescription>AI-powered recommendations based on your real data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analyticsData.tasks.completionRate > 70 && (
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-900">Task completion rate at {analyticsData.tasks.completionRate}%</p>
                  <p className="text-sm text-green-700">Great job maintaining efficiency in patient care tasks</p>
                </div>
              </div>
            )}
            
            {analyticsData.calls.successRate > 60 && (
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <Activity className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">Call success rate at {analyticsData.calls.successRate}%</p>
                  <p className="text-sm text-blue-700">AI phone agent is performing well</p>
                </div>
              </div>
            )}
            
            {analyticsData.schedule.utilizationRate > 80 && (
              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <Target className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="font-medium text-orange-900">Schedule utilization at {analyticsData.schedule.utilizationRate}%</p>
                  <p className="text-sm text-orange-700">Consider adding more appointment slots during peak hours</p>
                </div>
              </div>
            )}

            {analyticsData.calls.remainingCredits && analyticsData.calls.remainingCredits < 1000 && (
              <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-900">Low ElevenLabs credits: {analyticsData.calls.remainingCredits?.toLocaleString()} remaining</p>
                  <p className="text-sm text-yellow-700">Consider upgrading your plan to avoid service interruption</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
