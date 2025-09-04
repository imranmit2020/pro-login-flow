"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, PieChart, TrendingUp, Clock } from 'lucide-react';

interface CallAnalyticsChartProps {
  callsByStatus: Record<string, number>;
  callsByEndReason: Record<string, number>;
  totalCalls: number;
  successRate: number;
  averageDuration: string;
}

export function CallAnalyticsChart({
  callsByStatus,
  callsByEndReason,
  totalCalls,
  successRate,
  averageDuration
}: CallAnalyticsChartProps) {
  // Calculate percentages for pie chart visualization
  const statusData = useMemo(() => {
    return Object.entries(callsByStatus).map(([status, count]) => ({
      name: status,
      value: count,
      percentage: (count / totalCalls) * 100
    }));
  }, [callsByStatus, totalCalls]);

  const endReasonData = useMemo(() => {
    return Object.entries(callsByEndReason).map(([reason, count]) => ({
      name: reason,
      value: count,
      percentage: (count / totalCalls) * 100
    }));
  }, [callsByEndReason, totalCalls]);

  // Color mapping for different statuses
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'successful':
        return 'bg-green-500';
      case 'failed':
      case 'error':
        return 'bg-red-500';
      case 'in_progress':
      case 'ongoing':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getEndReasonColor = (reason: string) => {
    switch (reason.toLowerCase()) {
      case 'completed':
      case 'success':
        return 'bg-green-500';
      case 'user_hangup':
      case 'hangup':
        return 'bg-orange-500';
      case 'error':
      case 'timeout':
        return 'bg-red-500';
      case 'transferred':
      case 'transfer':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Call Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Call Status Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {statusData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${getStatusColor(item.name)}`} />
                  <span className="text-sm font-medium capitalize">
                    {item.name.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{item.value}</Badge>
                  <span className="text-sm text-gray-500">
                    {item.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Visual Bar Chart */}
          <div className="mt-6 space-y-2">
            {statusData.map((item, index) => (
              <div key={`bar-${item.name}`} className="flex items-center gap-2">
                <div className="w-20 text-xs text-gray-600 capitalize">
                  {item.name.slice(0, 8)}
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getStatusColor(item.name)}`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <div className="w-12 text-xs text-gray-600 text-right">
                  {item.percentage.toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* End Reason Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            End Reason Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {endReasonData.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${getEndReasonColor(item.name)}`} />
                  <span className="text-sm font-medium capitalize">
                    {item.name.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{item.value}</Badge>
                  <span className="text-sm text-gray-500">
                    {item.percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Visual Bar Chart */}
          <div className="mt-6 space-y-2">
            {endReasonData.map((item, index) => (
              <div key={`bar-${item.name}`} className="flex items-center gap-2">
                <div className="w-20 text-xs text-gray-600 capitalize">
                  {item.name.slice(0, 8)}
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getEndReasonColor(item.name)}`}
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <div className="w-12 text-xs text-gray-600 text-right">
                  {item.percentage.toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {successRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {totalCalls}
              </div>
              <div className="text-sm text-gray-600">Total Calls</div>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">Average Duration:</span>
              <span className="font-semibold">{averageDuration} min</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call Volume Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Call Volume Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Calls</span>
              <span className="font-semibold">{totalCalls}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Successful</span>
              <span className="font-semibold text-green-600">
                {Math.round(totalCalls * successRate / 100)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Failed</span>
              <span className="font-semibold text-red-600">
                {totalCalls - Math.round(totalCalls * successRate / 100)}
              </span>
            </div>
          </div>
          
          {/* Success Rate Visualization */}
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Success Rate</span>
              <span>{successRate.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${successRate}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 