"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Instagram, 
  Mail,
  Send,
  Clock,
  User
} from "lucide-react";

export function UnifiedMessagesSection() {
  const messages = [
    {
      id: 1,
      platform: "Instagram",
      icon: Instagram,
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      from: "@customer_jane",
      preview: "Hi! I'm interested in your services...",
      time: "2m ago",
      unread: true
    },
    {
      id: 2,
      platform: "Facebook",
      icon: MessageSquare,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      from: "John Smith",
      preview: "Can I schedule an appointment?",
      time: "15m ago",
      unread: true
    },
    {
      id: 3,
      platform: "Email",
      icon: Mail,
      color: "text-green-600",
      bgColor: "bg-green-50",
      from: "contact@example.com",
      preview: "Thank you for your response...",
      time: "1h ago",
      unread: false
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Unified Messages</h1>
          <p className="text-gray-600">All your messages in one place</p>
        </div>
        <Button>
          <Send className="h-4 w-4 mr-2" />
          Compose
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Messages</p>
                <p className="text-2xl font-bold text-gray-900">148</p>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Unread</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
              <Badge className="bg-red-100 text-red-800">New</Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Response</p>
                <p className="text-2xl font-bold text-gray-900">2.5h</p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Messages List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Messages</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-lg ${message.bgColor}`}>
                  <message.icon className={`h-5 w-5 ${message.color}`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{message.from}</span>
                    <Badge variant="secondary" className="text-xs">{message.platform}</Badge>
                    {message.unread && <Badge variant="destructive" className="text-xs">New</Badge>}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{message.preview}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">{message.time}</p>
                <Button variant="ghost" size="sm" className="mt-1">
                  Reply
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}