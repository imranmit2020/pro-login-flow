"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Facebook, Instagram, MessageCircle, Clock, User, Send } from "lucide-react";

interface Message {
  id: string;
  platform: 'facebook' | 'instagram';
  sender: string;
  content: string;
  timestamp: string;
  status: 'unread' | 'read' | 'replied';
  patientInfo?: {
    name: string;
    phone?: string;
    lastVisit?: string;
  };
}

const mockMessages: Message[] = [
  {
    id: "1",
    platform: "facebook",
    sender: "Sarah Johnson",
    content: "Hi! I'd like to schedule a teeth cleaning appointment. What are your available times this week?",
    timestamp: "2025-06-23T10:30:00Z",
    status: "unread",
    patientInfo: {
      name: "Sarah Johnson",
      phone: "(555) 123-4567",
      lastVisit: "2024-12-15"
    }
  },
  {
    id: "2",
    platform: "instagram",
    sender: "mike_dental_care",
    content: "Do you offer teeth whitening services? What's the cost?",
    timestamp: "2025-06-23T09:15:00Z",
    status: "read",
  },
  {
    id: "3",
    platform: "facebook",
    sender: "Jennifer Adams",
    content: "Thank you for the excellent service yesterday! My teeth feel amazing.",
    timestamp: "2025-06-23T08:45:00Z",
    status: "replied",
    patientInfo: {
      name: "Jennifer Adams",
      phone: "(555) 987-6543",
      lastVisit: "2025-06-22"
    }
  }
];

export function SocialMediaSection() {
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState("");

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handleReply = () => {
    if (replyText.trim()) {
      // Here you would integrate with Facebook/Instagram APIs
      console.log(`Replying to ${selectedMessage?.sender}: ${replyText}`);
      setReplyText("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Social Media Messages</h2>
          <p className="text-muted-foreground">Manage Facebook and Instagram communications</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Facebook className="h-3 w-3" />
            Connected
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-1">
            <Instagram className="h-3 w-3" />
            Connected
          </Badge>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Messages List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Recent Messages
            </CardTitle>
            <CardDescription>
              {mockMessages.filter(m => m.status === 'unread').length} unread messages
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockMessages.map((message) => (
              <div
                key={message.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedMessage?.id === message.id 
                    ? 'bg-accent border-accent-foreground/20' 
                    : 'hover:bg-muted/50'
                } ${message.status === 'unread' ? 'border-l-4 border-l-blue-500' : ''}`}
                onClick={() => setSelectedMessage(message)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {message.platform === 'facebook' ? 
                      <Facebook className="h-4 w-4 text-blue-600" /> : 
                      <Instagram className="h-4 w-4 text-pink-600" />
                    }
                    <span className="font-medium text-sm">{message.sender}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                  {message.content}
                </p>
                <div className="flex justify-between items-center mt-2">
                  <Badge 
                    variant={message.status === 'unread' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {message.status}
                  </Badge>
                  {message.patientInfo && (
                    <Badge variant="outline" className="text-xs">
                      <User className="h-3 w-3 mr-1" />
                      Patient
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Message Detail & Reply */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedMessage ? 'Message Details' : 'Select a message'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedMessage ? (
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    {selectedMessage.platform === 'facebook' ? 
                      <Facebook className="h-4 w-4 text-blue-600" /> : 
                      <Instagram className="h-4 w-4 text-pink-600" />
                    }
                    <span className="font-medium">{selectedMessage.sender}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {new Date(selectedMessage.timestamp).toLocaleString()}
                  </p>
                  <p className="text-sm">{selectedMessage.content}</p>
                </div>

                {selectedMessage.patientInfo && (
                  <div className="bg-muted/50 p-3 rounded-lg">
                    <h4 className="font-medium text-sm mb-2">Patient Information</h4>
                    <div className="space-y-1 text-xs">
                      <p><strong>Name:</strong> {selectedMessage.patientInfo.name}</p>
                      {selectedMessage.patientInfo.phone && (
                        <p><strong>Phone:</strong> {selectedMessage.patientInfo.phone}</p>
                      )}
                      {selectedMessage.patientInfo.lastVisit && (
                        <p><strong>Last Visit:</strong> {new Date(selectedMessage.patientInfo.lastVisit).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Reply</label>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                    className="w-full p-2 border rounded-md resize-none h-20 text-sm"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleReply} size="sm" className="flex items-center gap-1">
                      <Send className="h-3 w-3" />
                      Send Reply
                    </Button>
                    <Button variant="outline" size="sm">
                      Schedule Appointment
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Select a message to view details and reply
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Facebook className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Facebook</span>
            </div>
            <p className="text-2xl font-bold mt-1">12</p>
            <p className="text-xs text-muted-foreground">Messages today</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Instagram className="h-4 w-4 text-pink-600" />
              <span className="text-sm font-medium">Instagram</span>
            </div>
            <p className="text-2xl font-bold mt-1">8</p>
            <p className="text-xs text-muted-foreground">Messages today</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Avg Response</span>
            </div>
            <p className="text-2xl font-bold mt-1">15m</p>
            <p className="text-xs text-muted-foreground">Response time</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium">New Patients</span>
            </div>
            <p className="text-2xl font-bold mt-1">3</p>
            <p className="text-xs text-muted-foreground">From social media</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 