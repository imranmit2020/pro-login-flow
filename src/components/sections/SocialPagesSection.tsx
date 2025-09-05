"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Plus,
  MessageSquare,
  Instagram,
  TrendingUp,
  Clock,
  Settings,
  ExternalLink
} from "lucide-react";

export function SocialPagesSection() {
  const socialPages = [
    {
      id: 1,
      name: "OfinaPulse Business",
      platform: "Facebook",
      icon: MessageSquare,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      isConnected: true,
      profilePicture: "/api/placeholder/48/48",
      stats: {
        followers: 2500,
        totalMessages: 148,
        unreadMessages: 12,
        averageResponseTime: "2.5h",
        engagement: "8.5%"
      },
      lastActivity: "2 hours ago"
    },
    {
      id: 2,
      name: "@ofinapulse",
      platform: "Instagram",
      icon: Instagram,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      isConnected: true,
      profilePicture: "/api/placeholder/48/48",
      stats: {
        followers: 1850,
        totalMessages: 89,
        unreadMessages: 5,
        averageResponseTime: "1.8h",
        engagement: "12.3%"
      },
      lastActivity: "1 hour ago"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Social Pages</h1>
          <p className="text-gray-600">Manage your connected social media accounts</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Connect Page
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Connected Pages</p>
                <p className="text-2xl font-bold text-gray-900">{socialPages.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Followers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {socialPages.reduce((sum, page) => sum + page.stats.followers, 0).toLocaleString()}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unread Messages</p>
                <p className="text-2xl font-bold text-gray-900">
                  {socialPages.reduce((sum, page) => sum + page.stats.unreadMessages, 0)}
                </p>
              </div>
              <MessageSquare className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response</p>
                <p className="text-2xl font-bold text-gray-900">2.2h</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Social Pages List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {socialPages.map((page) => (
          <Card key={page.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${page.bgColor}`}>
                    <page.icon className={`h-6 w-6 ${page.color}`} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{page.name}</CardTitle>
                    <p className="text-sm text-gray-600">{page.platform}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {page.isConnected ? (
                    <Badge className="bg-green-100 text-green-800">Connected</Badge>
                  ) : (
                    <Badge className="bg-red-100 text-red-800">Disconnected</Badge>
                  )}
                  <Button variant="ghost" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-lg font-bold text-gray-900">{page.stats.followers.toLocaleString()}</p>
                  <p className="text-sm text-gray-600">Followers</p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-lg font-bold text-gray-900">{page.stats.engagement}</p>
                  <p className="text-sm text-gray-600">Engagement</p>
                </div>
              </div>

              {/* Message Stats */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Messages:</span>
                  <span className="font-medium">{page.stats.totalMessages}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Unread:</span>
                  <span className="font-medium text-orange-600">{page.stats.unreadMessages}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Avg Response Time:</span>
                  <span className="font-medium">{page.stats.averageResponseTime}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Last Activity:</span>
                  <span className="font-medium">{page.lastActivity}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button className="flex-1" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  View Messages
                </Button>
                <Button className="flex-1" variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Page
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Connection Help */}
      <Card>
        <CardHeader>
          <CardTitle>Connect New Social Page</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center p-6 border-2 border-dashed border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 text-blue-600" />
              <h3 className="font-medium text-gray-900 mb-2">Facebook Page</h3>
              <p className="text-sm text-gray-600 mb-3">Connect your Facebook business page to manage messages and posts</p>
              <Button variant="outline">Connect Facebook</Button>
            </div>
            
            <div className="text-center p-6 border-2 border-dashed border-gray-200 rounded-lg hover:border-pink-300 transition-colors cursor-pointer">
              <Instagram className="h-12 w-12 mx-auto mb-3 text-pink-600" />
              <h3 className="font-medium text-gray-900 mb-2">Instagram Business</h3>
              <p className="text-sm text-gray-600 mb-3">Connect your Instagram business account for DM management</p>
              <Button variant="outline">Connect Instagram</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}