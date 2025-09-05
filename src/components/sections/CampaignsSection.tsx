"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  Plus,
  Send,
  Clock,
  Users,
  TrendingUp,
  Instagram,
  MessageSquare,
  Mail
} from "lucide-react";

export function CampaignsSection() {
  const campaigns = [
    {
      id: 1,
      title: "Spring Product Launch",
      platform: "Instagram",
      icon: Instagram,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      scheduledDate: "2024-03-15",
      scheduledTime: "10:00 AM",
      status: "scheduled",
      reach: "2.5K",
      engagement: "320"
    },
    {
      id: 2,
      title: "Weekly Newsletter",
      platform: "Email",
      icon: Mail,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      scheduledDate: "2024-03-12",
      scheduledTime: "9:00 AM",
      status: "sent",
      reach: "1.8K",
      engagement: "250"
    },
    {
      id: 3,
      title: "Customer Appreciation Post",
      platform: "Facebook",
      icon: MessageSquare,
      color: "text-blue-700",
      bgColor: "bg-blue-100",
      scheduledDate: "2024-03-20",
      scheduledTime: "2:00 PM",
      status: "draft",
      reach: "-",
      engagement: "-"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Badge className="bg-blue-100 text-blue-800">Scheduled</Badge>;
      case "sent":
        return <Badge className="bg-green-100 text-green-800">Sent</Badge>;
      case "draft":
        return <Badge className="bg-gray-100 text-gray-800">Draft</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campaigns & Scheduling</h1>
          <p className="text-gray-600">Plan and schedule your marketing campaigns</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Campaign
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Campaigns</p>
                <p className="text-2xl font-bold text-gray-900">24</p>
              </div>
              <Send className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Reach</p>
                <p className="text-2xl font-bold text-gray-900">2.1K</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Engagement</p>
                <p className="text-2xl font-bold text-gray-900">12.5%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Campaigns</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${campaign.bgColor}`}>
                    <campaign.icon className={`h-6 w-6 ${campaign.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900">{campaign.title}</h3>
                      {getStatusBadge(campaign.status)}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{campaign.platform}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{campaign.scheduledDate}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{campaign.scheduledTime}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex gap-4 mb-2 text-sm">
                    <div>
                      <span className="text-gray-500">Reach: </span>
                      <span className="font-medium">{campaign.reach}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Engagement: </span>
                      <span className="font-medium">{campaign.engagement}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                    {campaign.status === "draft" && (
                      <Button size="sm">
                        Schedule
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Instagram className="h-12 w-12 mx-auto mb-3 text-pink-600" />
            <h3 className="font-medium text-gray-900 mb-2">Instagram Post</h3>
            <p className="text-sm text-gray-600">Create and schedule Instagram content</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 text-blue-600" />
            <h3 className="font-medium text-gray-900 mb-2">Facebook Post</h3>
            <p className="text-sm text-gray-600">Schedule Facebook page updates</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardContent className="p-6 text-center">
            <Mail className="h-12 w-12 mx-auto mb-3 text-green-600" />
            <h3 className="font-medium text-gray-900 mb-2">Email Campaign</h3>
            <p className="text-sm text-gray-600">Design and send email newsletters</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}