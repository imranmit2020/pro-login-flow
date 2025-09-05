"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Mail, 
  Send,
  Inbox,
  Archive,
  Star,
  Paperclip,
  Reply,
  Forward
} from "lucide-react";

export function EmailSection() {
  const emailStats = [
    { label: "Inbox", value: "23", icon: Inbox, color: "text-blue-600" },
    { label: "Sent", value: "156", icon: Send, color: "text-green-600" },
    { label: "Starred", value: "12", icon: Star, color: "text-yellow-600" },
    { label: "Archived", value: "89", icon: Archive, color: "text-gray-600" }
  ];

  const emails = [
    {
      id: 1,
      from: "john.doe@example.com",
      subject: "Project Update Required",
      preview: "Hi, I wanted to follow up on the project status...",
      time: "10:30 AM",
      unread: true,
      starred: true,
      hasAttachment: false
    },
    {
      id: 2,
      from: "sarah.wilson@company.com",
      subject: "Meeting Confirmation",
      preview: "Thank you for scheduling the meeting. I confirm...",
      time: "9:45 AM",
      unread: true,
      starred: false,
      hasAttachment: true
    },
    {
      id: 3,
      from: "support@service.com",
      subject: "Your Monthly Report",
      preview: "Your analytics report for this month is ready...",
      time: "Yesterday",
      unread: false,
      starred: false,
      hasAttachment: true
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Management</h1>
          <p className="text-gray-600">Manage your email communications efficiently</p>
        </div>
        <Button>
          <Send className="h-4 w-4 mr-2" />
          Compose
        </Button>
      </div>

      {/* Email Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {emailStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Email List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Recent Emails
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {emails.map((email) => (
            <div key={email.id} className={`p-4 border rounded-lg hover:bg-gray-50 cursor-pointer ${
              email.unread ? 'border-blue-200 bg-blue-50/30' : 'border-gray-200'
            }`}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-medium ${email.unread ? 'text-gray-900' : 'text-gray-700'}`}>
                      {email.from}
                    </span>
                    {email.starred && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                    {email.hasAttachment && <Paperclip className="h-4 w-4 text-gray-400" />}
                    {email.unread && <Badge variant="destructive" className="text-xs">New</Badge>}
                  </div>
                  <h3 className={`font-medium mb-1 ${email.unread ? 'text-gray-900' : 'text-gray-700'}`}>
                    {email.subject}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">{email.preview}</p>
                  <p className="text-xs text-gray-500">{email.time}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Reply className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Forward className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Archive className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}