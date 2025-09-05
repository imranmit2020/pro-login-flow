"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown,
  MessageSquare,
  Phone,
  Users,
  Clock,
  BarChart3,
  PieChart
} from "lucide-react";

interface AnalyticsSectionProps {
  subSection?: string;
  onAnalyticsSubSelect?: (subSection: string) => void;
}

export function AnalyticsSection({ subSection, onAnalyticsSubSelect }: AnalyticsSectionProps) {
  const overviewStats = [
    {
      title: "Total Messages",
      value: "2,847",
      change: "+12.5%",
      trend: "up",
      icon: MessageSquare,
      color: "text-blue-600"
    },
    {
      title: "Call Volume",
      value: "456",
      change: "+8.2%",
      trend: "up",
      icon: Phone,
      color: "text-green-600"
    },
    {
      title: "Response Time",
      value: "2.3h",
      change: "-15.4%",
      trend: "down",
      icon: Clock,
      color: "text-purple-600"
    },
    {
      title: "Customer Satisfaction",
      value: "94.2%",
      change: "+2.1%",
      trend: "up",
      icon: Users,
      color: "text-orange-600"
    }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {stat.trend === "up" ? (
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600" />
                    )}
                    <span className={`text-sm ${
                      stat.trend === "up" ? "text-green-600" : "text-red-600"
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Weekly Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center text-gray-500">
              Chart visualization would go here
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Platform Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Instagram</span>
                <Badge variant="secondary">45%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Facebook</span>
                <Badge variant="secondary">35%</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Email</span>
                <Badge variant="secondary">20%</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderSubSection = () => {
    switch (subSection) {
      case "messages":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Message Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Detailed message analytics and insights</p>
            </CardContent>
          </Card>
        );
      case "calls":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Call Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Call performance metrics and analysis</p>
            </CardContent>
          </Card>
        );
      case "engagement":
        return (
          <Card>
            <CardHeader>
              <CardTitle>Engagement Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Customer engagement and interaction analysis</p>
            </CardContent>
          </Card>
        );
      default:
        return renderOverview();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Track performance and insights across all channels</p>
        </div>
        <Button variant="outline">
          <TrendingUp className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {renderSubSection()}
    </div>
  );
}